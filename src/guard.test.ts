import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { check } from "./guard.js";

function app(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), "tk-guard-"));
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(join(dir, name, ".."), { recursive: true });
    writeFileSync(join(dir, name), text);
  }
  return dir;
}
const rules = (dir: string) => check([dir], dir).map((f) => f.rule);

test("an app built from the toolkit is clean", () => {
  const dir = app({
    "page.tsx": `import { AppShell, Panel } from "@jaetask/toolkit/suite";\nexport const Page = () => <AppShell app={{ name: "x" }} nav={[]}><Panel id="a" title="A">x</Panel></AppShell>;\n`,
    "app.css": ".x { color: var(--tk-muted); }\n",
  });
  assert.deepEqual(rules(dir), []);
});

test("a hand-built panel, a sheet and a literal colour fail", () => {
  const dir = app({
    "page.tsx": `import { AppShell } from "@jaetask/toolkit/suite";\nimport { Sheet } from "./ui/sheet";\nfunction Panel() { return <div style={{ color: "#ff0000" }} />; }\n`,
    "app.css": ".x { background: rgb(1 2 3); }\n.y { color: red; } /* named colours are fine */\n",
  });
  assert.deepEqual(rules(dir).sort(), ["no-sheet", "own-kit", "tokens-only", "tokens-only"]);
});

test("raw browser controls fail", () => {
  const dir = app({
    "page.tsx": `import { AppShell } from "@jaetask/toolkit/suite";\nconst a = <select />;\nconst b = <button type="button">Go</button>;\nconst c = <input />;\nconst d = <textarea />;\n`,
  });
  assert.deepEqual(rules(dir), [
    "toolkit-controls",
    "toolkit-controls",
    "toolkit-controls",
    "toolkit-controls",
  ]);
});

test("an app without the shell fails", () => {
  const dir = app({ "index.html": "<main></main>\n", "app.js": "document.title = 'x';\n" });
  assert.deepEqual(rules(dir), ["shell-present"]);
});

test("an allowed line is skipped", () => {
  const dir = app({
    "page.tsx": `import { AppShell } from "@jaetask/toolkit/suite";\nconst brand = "#0b4a8f"; // toolkit-guard-allow\n`,
  });
  assert.deepEqual(rules(dir), []);
});
