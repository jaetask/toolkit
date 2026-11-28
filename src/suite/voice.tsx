import { type SVGProps, useEffect, useRef, useSyncExternalStore } from "react";
import { Button } from "../ui/button.js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip.js";
import { type VoiceBackend, VoiceEngine, type VoiceState, type VoiceView } from "./voice-engine.js";

export type ChatVoice = VoiceView & {
  startRecording: () => void;
  stopRecording: () => void;
  stopSpeaking: () => void;
  startCall: () => void;
  endCall: () => void;
};

type IconProps = SVGProps<SVGSVGElement> & { size?: number };
const line = (size = 18) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const MicIcon = ({ size, ...p }: IconProps) => (
  <svg aria-hidden="true" {...line(size)} strokeWidth={2} {...p}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M12 17v4" />
  </svg>
);

export const WaveIcon = ({ size, ...p }: IconProps) => (
  <svg aria-hidden="true" {...line(size)} strokeWidth={2.4} {...p}>
    <path d="M5 10v4" />
    <path d="M9 7v10" />
    <path d="M13 4v16" />
    <path d="M17 8v8" />
    <path d="M21 11v2" />
  </svg>
);

export const StopIcon = ({ size = 16, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

export const VOICE_STATUS: Record<VoiceState, string> = {
  idle: "",
  recording: "Listening… let go to send",
  busy: "Thinking…",
  listening: "On a call · listening",
  hearing: "On a call · hearing you…",
  thinking: "On a call · thinking…",
  speaking: "Speaking · Esc to stop",
};

export function useChatVoice(backend: VoiceBackend): ChatVoice {
  const engine = useRef<VoiceEngine | null>(null);
  engine.current ??= new VoiceEngine(backend);
  const e = engine.current;
  e.backend = backend;
  useEffect(() => () => e.close(), [e]);
  const view = useSyncExternalStore(e.subscribe, e.read, e.read);
  return {
    ...view,
    startRecording: () => void e.startRecording(),
    stopRecording: () => e.stopRecording(),
    stopSpeaking: () => e.stopSpeaking(),
    startCall: () => void e.startCall(),
    endCall: () => e.endCall(),
  };
}

const typing = (t: EventTarget | null) =>
  t instanceof HTMLElement && (/^(SELECT|INPUT|TEXTAREA)$/.test(t.tagName) || t.isContentEditable);

function Tip({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

export function VoiceControls({ voice }: { voice: ChatVoice }) {
  const keep = useRef(voice);
  keep.current = voice;
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !typing(e.target)) {
        e.preventDefault();
        keep.current.startRecording();
      }
      if (e.key === "Escape") keep.current.stopSpeaking();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space" && !typing(e.target)) {
        e.preventDefault();
        keep.current.stopRecording();
      }
    };
    const release = () => keep.current.stopRecording();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("pointerup", release);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("pointerup", release);
    };
  }, []);

  const { state, onCall } = voice;
  const recording = state === "recording";
  const speaking = state === "speaking" || state === "busy";
  return (
    <TooltipProvider delayDuration={300}>
      <div className="tk-voice">
        <span className="sr-only" aria-live="polite">
          {VOICE_STATUS[state]}
        </span>
        {state !== "idle" && <span className="tk-voice-status">{VOICE_STATUS[state]}</span>}
        {speaking && !onCall ? (
          <Tip label="Stop talking (Esc)">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8 rounded-full"
              aria-label="Stop talking"
              onClick={voice.stopSpeaking}
            >
              <StopIcon size={16} />
            </Button>
          </Tip>
        ) : (
          <Tip label="Hold to talk (or hold Space)">
            <Button
              type="button"
              size="icon"
              variant={recording ? "destructive" : "ghost"}
              disabled={onCall}
              className="size-8 rounded-full"
              aria-label={recording ? "Listening, let go to send" : "Hold to talk"}
              aria-pressed={recording}
              onPointerDown={(e) => {
                e.preventDefault();
                voice.startRecording();
              }}
            >
              <MicIcon size={18} />
            </Button>
          </Tip>
        )}
        <Tip label={onCall ? "End the voice call" : "Start a hands-free voice call"}>
          <Button
            type="button"
            size="icon"
            variant={onCall ? "destructive" : "default"}
            aria-pressed={onCall}
            className={`tk-voice-call${onCall ? " is-on" : ""}`}
            aria-label={onCall ? "End the voice call" : "Start a voice call"}
            onClick={onCall ? voice.endCall : voice.startCall}
          >
            <WaveIcon size={18} />
          </Button>
        </Tip>
      </div>
    </TooltipProvider>
  );
}
