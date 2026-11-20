// Fails when a tracked file names a private source, a person or a home path. The toolkit is public.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const banned = [
  /trenches\s*fund/i,
  /@trenchesfund\//i,
  /modular-agent-native/i,
  /\bgrokbot\b/i,
  /\/Users\/[a-z]/i,
  /\/home\/[a-z]/i,
  /npm\.pkg\.github\.com/i,
];
const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  encoding: "utf8",
})
  .split("\n")
  .filter((f) => f && f !== "scripts/check-scrub.mjs" && !f.endsWith(".svg"));
let bad = 0;
for (const file of files) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  text.split("\n").forEach((line, i) => {
    for (const re of banned)
      if (re.test(line)) {
        console.error(`${file}:${i + 1}  matches ${re}`);
        bad++;
      }
  });
}
if (bad) {
  console.error(`check-scrub: ${bad} line(s) name something private.`);
  process.exit(1);
}
