import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const pixels = (size: string) =>
  size.endsWith("rem") ? Number.parseFloat(size) * 16 : Number.parseFloat(size);

test("no suite text is smaller than 13 pixels", () => {
  const sizes = [...read("./suite/suite.css").matchAll(/font-size: ([0-9.]+(?:px|rem));/g)].map(
    (m) => m[1] as string,
  );
  assert.ok(sizes.length > 20);
  for (const size of sizes) assert.ok(pixels(size) >= 13, `font-size ${size} is under 13px`);
});

test("small Tailwind text is 13 pixels and body text 15", () => {
  const styles = read("./styles.css");
  assert.match(styles, /--text-xs: 0\.8125rem;/);
  assert.match(styles, /--text-sm: 0\.9375rem;/);
});
