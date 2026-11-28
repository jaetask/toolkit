export type VoiceState =
  | "idle"
  | "recording"
  | "busy"
  | "listening"
  | "hearing"
  | "thinking"
  | "speaking";

export type VoiceBackend = {
  transcribe: (pcm: Int16Array, rate: number) => Promise<string>;
  speak: (text: string) => Promise<{ pcm: Int16Array; rate: number }>;
  ask: (text: string) => Promise<string | null>;
  workletUrl?: string;
};

export type VoiceView = { state: VoiceState; onCall: boolean; error: string };

export const MIC_RATE = 16000;
const FRAME_MS = 40;
const BARGE_THRESHOLD = 0.85;
const SHORTEST_PRESS_MS = 250;

export const PCM_WORKLET = `class PcmCapture extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.target = options.processorOptions?.rate || 16000;
    this.ratio = sampleRate / this.target;
    this.frame = new Int16Array(Math.round(this.target * 0.04));
    this.n = 0; this.sum = 0; this.cnt = 0; this.t = 0;
  }
  process(inputs) {
    const ch = inputs[0]?.[0];
    if (!ch) return true;
    for (let i = 0; i < ch.length; i++) {
      this.sum += ch[i]; this.cnt++; this.t += 1;
      if (this.t >= this.ratio) {
        this.t -= this.ratio;
        const v = Math.max(-1, Math.min(1, this.sum / this.cnt));
        this.sum = 0; this.cnt = 0;
        this.frame[this.n++] = v < 0 ? v * 0x8000 : v * 0x7fff;
        if (this.n === this.frame.length) {
          const out = this.frame.slice(0);
          this.port.postMessage(out.buffer, [out.buffer]);
          this.n = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor("pcm-capture", PcmCapture);
`;

export function micErrorMessage(e: unknown): string {
  const name = (e as { name?: string } | null)?.name;
  if (name === "NotAllowedError" || name === "SecurityError")
    return "Microphone access was blocked. Allow it in your browser's site settings.";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "No microphone found.";
  if (name === "NotReadableError") return "Your microphone is in use by another app.";
  if (!navigator.mediaDevices?.getUserMedia)
    return "This browser can't use the microphone here. It needs HTTPS or localhost.";
  return (e as Error | null)?.message || "Could not open the microphone.";
}

class Mic {
  private source: MediaStreamAudioSourceNode | null = null;
  private node: AudioWorkletNode | null = null;
  private sink: GainNode | null = null;

  constructor(
    private ctx: AudioContext,
    private stream: MediaStream,
    private onFrame: (pcm: Int16Array) => void,
  ) {}

  async start(workletUrl: string) {
    await this.ctx.audioWorklet.addModule(workletUrl);
    this.source = this.ctx.createMediaStreamSource(this.stream);
    this.node = new AudioWorkletNode(this.ctx, "pcm-capture", {
      processorOptions: { rate: MIC_RATE },
      numberOfInputs: 1,
      numberOfOutputs: 1,
      channelCount: 1,
      channelCountMode: "explicit",
    });
    this.node.port.onmessage = (e: MessageEvent<ArrayBuffer>) =>
      this.onFrame(new Int16Array(e.data));
    this.sink = this.ctx.createGain();
    this.sink.gain.value = 0;
    this.source.connect(this.node).connect(this.sink).connect(this.ctx.destination);
  }

  stop() {
    try {
      this.source?.disconnect();
      this.node?.disconnect();
      this.sink?.disconnect();
    } catch {}
    if (this.node) this.node.port.onmessage = null;
    for (const t of this.stream.getTracks()) t.stop();
  }
}

class Player {
  private sources = new Set<AudioBufferSourceNode>();
  private nextTime = 0;
  private waiters: (() => void)[] = [];

  constructor(private ctx: AudioContext) {}

  push(pcm: Int16Array, rate: number) {
    if (!pcm.length) return;
    if (this.ctx.state === "suspended") void this.ctx.resume().catch(() => {});
    const buf = this.ctx.createBuffer(1, pcm.length, rate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) ch[i] = (pcm[i] ?? 0) / 0x8000;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.ctx.destination);
    const now = this.ctx.currentTime;
    const at = this.nextTime > now ? this.nextTime : now + 0.06;
    src.start(at);
    this.nextTime = at + buf.duration;
    this.sources.add(src);
    src.onended = () => {
      this.sources.delete(src);
      if (!this.sources.size) this.settle();
    };
  }

  clear() {
    for (const s of this.sources) {
      s.onended = null;
      try {
        s.stop();
      } catch {}
    }
    this.sources.clear();
    this.nextTime = 0;
    this.settle();
  }

  idle(): Promise<void> {
    if (!this.sources.size) return Promise.resolve();
    return new Promise((resolve) => this.waiters.push(resolve));
  }

  private settle() {
    for (const w of this.waiters.splice(0)) w();
  }
}

const rms = (frame: Int16Array) => {
  let sum = 0;
  for (let i = 0; i < frame.length; i++) sum += ((frame[i] ?? 0) / 0x8000) ** 2;
  return frame.length ? Math.sqrt(sum / frame.length) : 0;
};

export class TurnDetector {
  private noise = 0.003;
  private readonly startFrames = Math.round(250 / FRAME_MS);
  private readonly endFrames = Math.round(700 / FRAME_MS);
  private readonly minFrames = Math.round(300 / FRAME_MS);
  private readonly preroll = Math.round(300 / FRAME_MS);
  private ring: Int16Array[] = [];
  private window: boolean[] = [];
  private silent = 0;
  private speechFrames = 0;
  private frames: Int16Array[] = [];
  private finished: Int16Array[] = [];
  active = false;

  private speech(frame: Int16Array, threshold: number) {
    const level = rms(frame);
    this.noise =
      level < this.noise ? this.noise * 0.9 + level * 0.1 : this.noise * 0.999 + level * 0.001;
    const over = level / (Math.max(this.noise, 0.0015) * 3.5);
    return Math.max(0, Math.min(1, over / 2)) >= threshold;
  }

  reset() {
    this.ring = [];
    this.window = [];
    this.active = false;
    this.silent = 0;
    this.speechFrames = 0;
    this.frames = [];
  }

  feed(frame: Int16Array, threshold = 0.5): "start" | "end" | "blip" | undefined {
    const speech = this.speech(frame, threshold);
    if (!this.active) {
      this.ring = [...this.ring, frame].slice(-this.preroll);
      this.window = [...this.window, speech].slice(-this.startFrames);
      const voiced = this.window.filter(Boolean).length;
      if (
        speech &&
        this.window.length === this.startFrames &&
        voiced >= Math.max(1, Math.floor(this.startFrames * 0.75 + 0.5))
      ) {
        this.active = true;
        this.silent = 0;
        this.speechFrames = voiced;
        this.window = [];
        this.frames = [...this.ring];
        return "start";
      }
      return undefined;
    }
    this.frames.push(frame);
    if (speech) {
      this.silent = 0;
      this.speechFrames++;
      return undefined;
    }
    this.silent++;
    if (this.silent < this.endFrames) return undefined;
    const enough = this.speechFrames >= this.minFrames;
    this.finished = this.frames;
    this.reset();
    return enough ? "end" : "blip";
  }

  utterance(): Int16Array {
    return joined(this.finished);
  }
}

const joined = (chunks: Int16Array[]) => {
  const out = new Int16Array(chunks.reduce((n, c) => n + c.length, 0));
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
};

export function sentences(text: string): string[] {
  const flat = text
    .split(/\n\s*\n/)
    .flatMap((para) => para.replace(/\s+/g, " ").match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g) ?? [])
    .map((s) => s.trim())
    .filter((s) => /\w/.test(s));
  const out: string[] = [];
  for (const s of flat) {
    const last = out[out.length - 1];
    if (last !== undefined && last.length < 80 && last.length + s.length < 250)
      out[out.length - 1] = `${last} ${s}`;
    else out.push(s);
  }
  return out;
}

let blobWorklet: string | null = null;
const workletOf = (backend: VoiceBackend) => {
  if (backend.workletUrl) return backend.workletUrl;
  blobWorklet ??= URL.createObjectURL(new Blob([PCM_WORKLET], { type: "application/javascript" }));
  return blobWorklet;
};

export class VoiceEngine {
  view: VoiceView = { state: "idle", onCall: false, error: "" };
  private listeners = new Set<() => void>();
  private ctx: AudioContext | null = null;
  private player: Player | null = null;
  private mic: Mic | null = null;
  private chunks: Int16Array[] = [];
  private pressedAt = 0;
  private opening = false;
  private turns = new TurnDetector();
  private turn = 0;

  constructor(public backend: VoiceBackend) {}

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  read = () => this.view;

  private set(next: Partial<VoiceView>) {
    this.view = { ...this.view, ...next };
    for (const l of this.listeners) l();
  }

  private audio() {
    if (!this.ctx) {
      const Ctx: typeof AudioContext =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx({ latencyHint: "interactive" });
      this.player = new Player(this.ctx);
    }
    void this.ctx.resume().catch(() => {});
    return { ctx: this.ctx, player: this.player as Player };
  }

  private async openMic(onFrame: (pcm: Int16Array) => void) {
    const { ctx } = this.audio();
    if (!navigator.mediaDevices?.getUserMedia)
      throw Object.assign(new Error("no microphone"), { name: "NotSupportedError" });
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    });
    const mic = new Mic(ctx, stream, onFrame);
    await mic.start(workletOf(this.backend));
    return mic;
  }

  private closeMic() {
    this.mic?.stop();
    this.mic = null;
  }

  async startRecording() {
    if (this.view.onCall || this.mic || this.opening) return;
    this.stopSpeaking();
    this.opening = true;
    this.chunks = [];
    this.pressedAt = performance.now();
    this.set({ state: "recording", error: "" });
    try {
      this.mic = await this.openMic((pcm) => this.chunks.push(pcm));
    } catch (e) {
      this.set({ state: "idle", error: micErrorMessage(e) });
    } finally {
      this.opening = false;
    }
  }

  stopRecording() {
    if (this.view.state !== "recording" || this.view.onCall) return;
    const short = performance.now() - this.pressedAt < SHORTEST_PRESS_MS;
    const pcm = joined(this.chunks);
    this.chunks = [];
    this.closeMic();
    if (short || !pcm.length) {
      this.set({ state: "idle" });
      return;
    }
    void this.respond(pcm, ++this.turn);
  }

  stopSpeaking() {
    this.turn++;
    this.player?.clear();
    this.turns.reset();
    if (this.view.state === "speaking" || this.view.state === "busy")
      this.set({ state: this.view.onCall ? "listening" : "idle" });
  }

  async startCall() {
    if (this.view.onCall) return;
    this.stopSpeaking();
    this.closeMic();
    this.turns.reset();
    this.set({ onCall: true, state: "listening", error: "" });
    try {
      this.mic = await this.openMic((pcm) => this.frame(pcm));
    } catch (e) {
      this.set({ onCall: false, state: "idle", error: micErrorMessage(e) });
    }
  }

  endCall() {
    if (!this.view.onCall) return;
    this.turn++;
    this.closeMic();
    this.player?.clear();
    this.set({ onCall: false, state: "idle" });
  }

  close() {
    this.turn++;
    this.closeMic();
    this.player?.clear();
    void this.ctx?.close().catch(() => {});
    this.ctx = null;
    this.player = null;
  }

  private frame(pcm: Int16Array) {
    const state = this.view.state;
    if (state === "listening" || state === "hearing") {
      const event = this.turns.feed(pcm);
      if (event === "start") this.set({ state: "hearing" });
      else if (event === "blip") this.set({ state: "listening" });
      else if (event === "end") void this.respond(this.turns.utterance(), ++this.turn);
    } else if (state === "speaking" && this.turns.feed(pcm, BARGE_THRESHOLD) === "start") {
      this.turn++;
      this.player?.clear();
      this.set({ state: "hearing" });
    }
  }

  private async respond(pcm: Int16Array, mine: number) {
    const live = () => mine === this.turn;
    const rest = () => (this.view.onCall ? "listening" : "idle");
    this.set({ state: this.view.onCall ? "thinking" : "busy" });
    try {
      const text = (await this.backend.transcribe(pcm, MIC_RATE)).trim();
      if (!live()) return;
      if (!/\w/.test(text)) {
        this.set({ state: rest() });
        return;
      }
      const answer = await this.backend.ask(text);
      if (!live()) return;
      if (answer) {
        this.turns.reset();
        this.set({ state: "speaking" });
        const { player } = this.audio();
        const parts = sentences(answer).map((s) => this.backend.speak(s));
        for (const part of parts) {
          const { pcm: said, rate } = await part;
          if (!live()) return;
          player.push(said, rate);
        }
        await player.idle();
      }
      if (live()) {
        this.turns.reset();
        this.set({ state: rest() });
      }
    } catch (e) {
      if (live()) this.set({ state: rest(), error: (e as Error).message });
    }
  }
}
