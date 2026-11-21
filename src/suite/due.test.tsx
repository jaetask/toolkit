import assert from "node:assert/strict";
import { test } from "node:test";
import { endOfWeek, parseDue } from "./due.js";

const now = new Date(2026, 10, 20, 15, 0);

test("words for a due date become a day", () => {
  const cases: [string, string | null][] = [
    ["today", "2026-11-20"],
    ["Tomorrow", "2026-11-21"],
    ["24h", "2026-11-21"],
    ["9h", "2026-11-21"],
    ["7 days", "2026-11-27"],
    ["3d", "2026-11-23"],
    ["in 2 weeks", "2026-12-04"],
    ["1w", "2026-11-27"],
    ["mon", "2026-11-23"],
    ["friday", "2026-11-27"],
    ["Feb 9", "2027-02-09"],
    ["9 feb", "2027-02-09"],
    ["Nov 30", "2026-11-30"],
    ["December 1st", "2026-12-01"],
    ["2026-12-24", "2026-12-24"],
    ["2026-02-30", null],
    ["Feb 31", null],
    ["soon", null],
    ["", null],
    ["fr", null],
  ];
  for (const [text, want] of cases) assert.equal(parseDue(text, now), want, text);
});

test("the end of the week is its Friday", () => {
  assert.equal(endOfWeek(now), "2026-11-20");
  assert.equal(endOfWeek(new Date(2026, 10, 17)), "2026-11-20");
  assert.equal(endOfWeek(new Date(2026, 10, 21)), "2026-11-27");
});

test("a due date reads by how near it is, and its icon takes the colour of its state", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { DueDatePicker, DueIcon, dueLabel, dueState } = await import("./index.js");
  const now = new Date(2026, 10, 20, 12);
  assert.equal(dueLabel("2026-11-20", now), "Today");
  assert.equal(dueLabel("2026-11-21", now), "Tomorrow");
  assert.equal(dueLabel("2026-11-19", now), "Yesterday");
  assert.equal(dueLabel("2026-12-25", now), "Dec 25");
  assert.equal(dueLabel("2027-01-05", now), "Jan 5, 2027");
  assert.equal(dueState("2026-11-19", now), "overdue");
  assert.equal(dueState("2026-11-21", now), "soon");
  assert.equal(dueState("2026-11-30", now), "later");
  assert.match(renderToStaticMarkup(<DueIcon due="2000-01-01" />), /text-red-600/);
  assert.match(renderToStaticMarkup(<DueIcon due={null} />), /text-muted-foreground/);
  const closed = renderToStaticMarkup(
    <DueDatePicker value={null} onChange={() => {}}>
      <button type="button">Set due date</button>
    </DueDatePicker>,
  );
  assert.match(closed, /Set due date/);
  assert.doesNotMatch(closed, /Try: 24h/);
});
