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

test("a hand-built panel and a literal colour fail", () => {
  const dir = app({
    "page.tsx": `import { AppShell } from "@jaetask/toolkit/suite";\nfunction Panel() { return <div style={{ color: "#ff0000" }} />; }\n`,
    "app.css": ".x { background: rgb(1 2 3); }\n.y { color: red; } /* named colours are fine */\n",
  });
  assert.deepEqual(rules(dir).sort(), ["own-kit", "tokens-only", "tokens-only"]);
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

test("a colour picked from a list of names fails", () => {
  const dir = app({
    "page.tsx": `import { AppShell } from "@jaetask/toolkit/suite";\nconst a = <SelectItem value="g">Green</SelectItem>;\n`,
  });
  assert.deepEqual(rules(dir), ["colour-swatches"]);
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

test("a ring or an outline on focus fails; asking for none is fine", () => {
  const dir = app({
    "page.tsx": `import { AppShell } from "@jaetask/toolkit/suite";
const a = "rounded focus-visible:ring-2 focus-visible:ring-ring";
const b = "focus:outline-2";
const c = "focus-visible:outline-ring";
const fine = "focus-visible:outline-none focus:ring-0 ring-1";
`,
    "app.css":
      ".x:focus-visible { outline: 2px solid var(--tk-focus); }\n.y:focus { outline: none; }\n",
  });
  assert.deepEqual(rules(dir), [
    "no-focus-rings",
    "no-focus-rings",
    "no-focus-rings",
    "no-focus-rings",
  ]);
});

test("the suite's own parts ask for no ring on focus", async () => {
  const { readdirSync, readFileSync } = await import("node:fs");
  const { focusRing } = await import("./guard.js");
  const dir = new URL("./suite/", import.meta.url);
  for (const name of readdirSync(dir).filter((n) => n.endsWith(".tsx") && !n.includes(".test."))) {
    const found = readFileSync(new URL(name, dir), "utf8")
      .split("\n")
      .filter((line) => focusRing.test(line));
    assert.deepEqual(found, [], name);
  }
});

test("a bordered box with no side padding fails, and one pulled back by a margin passes", () => {
  const tight = app({
    "page.tsx": `import { AppShell } from "@jaetask/toolkit/suite";\nconst a = <i className="h-auto border-transparent px-0 text-lg hover:border-input" />;\n`,
  });
  assert.deepEqual(rules(tight), ["room-inside"]);
  const roomy = app({
    "page.tsx": `import { AppShell } from "@jaetask/toolkit/suite";\nconst a = <i className="-mx-3 h-auto border-transparent px-3 text-lg hover:border-input" />;\nconst b = <i className="size-6 rounded-full p-0" />;\nconst c = <i className="border-0 px-0" />;\n`,
  });
  assert.deepEqual(rules(roomy), []);
});
