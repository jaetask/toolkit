import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

type Part = { exports: string[]; radix: string[] };
const src = (path: string) => new URL(`./${path}`, import.meta.url);
const recorded: Record<string, Part> = JSON.parse(
  readFileSync(src("agent-native-parts.json"), "utf8"),
);

const exportsOf = (text: string) => {
  const names = new Set<string>();
  for (const m of text.matchAll(
    /export\s+(?:async\s+)?(?:function|const|class|let|interface|type)\s+(\w+)/g,
  ))
    if (m[1]) names.add(m[1]);
  for (const m of text.matchAll(/export\s*(?:type\s*)?\{([^}]*)\}/g))
    for (const part of (m[1] ?? "").split(",")) {
      const name = part.trim().replace(/^type\s+/, "");
      if (name) names.add(name.split(" as ").pop()?.trim() ?? name);
    }
  return names;
};

for (const [path, part] of Object.entries(recorded)) {
  test(`${path} matches the agent-native toolkit`, () => {
    assert.ok(existsSync(src(path)), `${path} is missing`);
    const text = readFileSync(src(path), "utf8");
    const ours = exportsOf(text);
    const missing = part.exports.filter((name) => !ours.has(name));
    assert.deepEqual(missing, [], `${path} no longer exports ${missing.join(", ")}`);
    for (const pkg of part.radix)
      assert.ok(text.includes(`"${pkg}"`), `${path} no longer imports ${pkg}`);
    assert.doesNotMatch(text, /<select[\s>]/, `${path} renders a browser select`);
  });
}
