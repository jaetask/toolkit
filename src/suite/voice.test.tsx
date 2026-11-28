import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { type ChatVoice, ChatPane, sentences, TurnDetector } from "./index.js";

const voice = (state: ChatVoice["state"], onCall = false): ChatVoice => ({
  state,
  onCall,
  error: "",
  startRecording: () => {},
  stopRecording: () => {},
  stopSpeaking: () => {},
  startCall: () => {},
  endCall: () => {},
});

const pane = (v: ChatVoice) =>
  renderToStaticMarkup(<ChatPane label="Claude" lines={[]} onSend={() => {}} voice={v} />);

test("the composer offers hold to talk and a voice call beside Send", () => {
  const html = pane(voice("idle"));
  assert.match(html, /aria-label="Hold to talk"/);
  assert.match(html, /aria-label="Start a voice call"/);
  assert.ok(html.indexOf("Start a voice call") < html.indexOf('aria-label="Send"'));
  assert.doesNotMatch(html, /tk-voice-status/);
});

test("while a reply is read aloud the mic becomes Stop and the status says Esc stops it", () => {
  const html = pane(voice("speaking"));
  assert.match(html, /Speaking · Esc to stop/);
  assert.match(html, /aria-label="Stop talking"/);
  assert.doesNotMatch(html, /aria-label="Hold to talk"/);
});

test("on a call the wave button ends it and the status follows the call", () => {
  const html = pane(voice("hearing", true));
  assert.match(html, /On a call · hearing you…/);
  assert.match(html, /aria-label="End the voice call"/);
  assert.match(html, /tk-voice-call is-on/);
});

test("a voice error shows where chat problems show", () => {
  const html = pane({ ...voice("idle"), error: "No microphone found." });
  assert.match(html, /role="alert"[^>]*>No microphone found\./);
});

test("a turn starts on speech and ends after a pause", () => {
  const turns = new TurnDetector();
  const quiet = new Int16Array(640);
  const loud = new Int16Array(640).map((_, i) => (i % 2 ? 9000 : -9000));
  const events: string[] = [];
  for (let i = 0; i < 20; i++) turns.feed(quiet);
  for (let i = 0; i < 20; i++) {
    const e = turns.feed(loud);
    if (e) events.push(e);
  }
  for (let i = 0; i < 30; i++) {
    const e = turns.feed(quiet);
    if (e) events.push(e);
  }
  assert.deepEqual(events, ["start", "end"]);
  assert.ok(turns.utterance().length >= 20 * 640);
});

test("a reply is read sentence by sentence, a short one joined to the next", () => {
  assert.deepEqual(sentences("Done. I cut the **first** line."), [
    "Done. I cut the **first** line.",
  ]);
  const long = "The opening now leads with the result you got, so a reader sees the proof first.";
  assert.deepEqual(sentences(`${long}\n\n${long} Want a grade?`), [long, long, "Want a grade?"]);
});
