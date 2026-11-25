import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { type ChatLine, ChatPane, dollars, ModelSwitcher, Trajectory, usageOf } from "./index.js";

const lines: ChatLine[] = [
  { id: "1", from: "person", text: "Tighten the opening", at: "2026-11-25T10:00:00.000Z" },
  {
    id: "2",
    from: "assistant",
    text: "Done. I **cut** the first line.",
    at: "2026-11-25T10:00:00.000Z",
    status: "done",
    steps: [
      {
        kind: "model",
        label: "claude-opus-5-5 · medium",
        at: "2026-11-25T10:00:00.000Z",
        ms: 2000,
        cost: 0.012,
        tokens: { input: 1000, output: 200, cacheRead: 3000, cacheWrite: 0 },
      },
      {
        kind: "tool",
        label: "save-draft",
        at: "2026-11-25T10:00:02.000Z",
        ms: 40,
        state: "succeeded",
      },
      { kind: "tool", label: "grade", at: "2026-11-25T10:00:02.100Z", ms: 30, bad: true },
    ],
  },
];

test("the chat pane shows each line, a Trajectory tab and the composer", () => {
  const html = renderToStaticMarkup(
    <ChatPane label="Claude" lines={lines} onSend={() => undefined} footer={<span>$0.01</span>} />,
  );
  assert.match(html, /aria-label="Chat with Claude"/);
  assert.match(html, /Tighten the opening/);
  assert.match(html, /<strong>cut<\/strong>/);
  assert.match(html, />Trajectory</);
  assert.match(html, /aria-label="Message Claude"/);
  assert.match(html, /\$0\.01/);
});

test("an empty chat shows its hint, and a problem replaces the footer", () => {
  const html = renderToStaticMarkup(
    <ChatPane
      label="Claude"
      lines={[]}
      onSend={() => undefined}
      empty="Ask about this article"
      footer="cost"
      problem="No key yet"
    />,
  );
  assert.match(html, /Ask about this article/);
  assert.match(html, /role="alert"[^>]*>No key yet/);
  assert.doesNotMatch(html, />cost</);
});

test("the trajectory sums model calls and draws a bar per step", () => {
  const usage = usageOf(lines);
  assert.equal(usage.calls, 1);
  assert.equal(usage.tokens.cacheRead, 3000);
  const html = renderToStaticMarkup(<Trajectory lines={lines} />);
  assert.match(html, /1 model call · \$0\.01/);
  assert.match(html, /aria-label="Turn 1"/);
  assert.equal(html.match(/class="tk-turn-bar/g)?.length, 3);
  assert.match(html, /tk-turn-bar tool bad/);
});

test("dollars shows small costs to four places", () => {
  assert.equal(dollars(0), "$0");
  assert.equal(dollars(0.0042), "$0.0042");
  assert.equal(dollars(12.5), "$12.50");
});

test("the model switcher shows the chosen model and effort", () => {
  const html = renderToStaticMarkup(
    <ModelSwitcher
      models={[
        { id: "a", label: "Model A" },
        { id: "b", label: "Model B" },
      ]}
      efforts={["low", "medium"]}
      value={{ model: "b", effort: "medium" }}
      onChange={() => undefined}
    />,
  );
  assert.match(html, /aria-label="Model"/);
  assert.match(html, /aria-label="Effort"/);
});
