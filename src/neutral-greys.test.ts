import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync(new URL("./suite/suite.css", import.meta.url), "utf8");
const GREYS = [
  "muted",
  "line",
  "line-strong",
  "panel",
  "card",
  "page",
  "side",
  "side-fill",
  "side-text",
  "side-line",
  "todo",
];

test("the suite's surfaces, lines and muted text are neutral greys, with no warm tint", () => {
  for (const name of GREYS) {
    const values = [...css.matchAll(new RegExp(`--tk-${name}: (#[0-9a-fA-F]{6});`, "g"))].map(
      (m) => m[1] ?? "",
    );
    assert.ok(values.length > 0, `--tk-${name} is defined`);
    for (const hex of values) {
      const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
      assert.ok(
        Math.max(r ?? 0, g ?? 0, b ?? 0) - Math.min(r ?? 0, g ?? 0, b ?? 0) <= 2,
        `--tk-${name} ${hex} is a neutral grey`,
      );
    }
  }
});
