#!/usr/bin/env node
import { readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export type Finding = { file: string; line: number; rule: string; message: string };

const KIT = [
  "AppShell",
  "Sidebar",
  "PageBody",
  "Panel",
  "EditFrame",
  "EditLink",
  "Row",
  "ListCard",
  "ListRow",
  "EmptyCard",
  "StatusDot",
  "BackLink",
  "ChipPicker",
  "WorkPage",
  "PageSection",
  "FormDialog",
  "RowMenu",
  "InlineText",
  "FilterMenu",
  "PageControls",
  "PageGroups",
  "PageGroup",
  "EntityNav",
];
const CODE = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const STYLE = new Set([".css", ".scss"]);
const PAGE = new Set([".html"]);
const SKIP = new Set(["node_modules", "dist", "build", ".git", "coverage"]);

const ownKit = new RegExp(
  `\\b(?:function|const|let|class)\\s+(${KIT.join("|")})\\b(?!\\s*=\\s*(?:require|await import))`,
);
const rawControl = /<(select|button|input|textarea)[\s>/]/;
const CONTROL: Record<string, string> = {
  select: "Select",
  button: "Button",
  input: "Input or Checkbox",
  textarea: "Textarea",
};
const colourByName =
  /<(SelectItem|option|ToggleGroupItem|DropdownMenuItem|DropdownMenuRadioItem)\b[^>]*>\s*(Grey|Gray|Slate|Indigo|Cyan|Green|Yellow|Orange|Rose|Red|Purple|Blue|Pink|Brown|Teal|Amber)\s*</;
const colour =
  /(?:^|[\s:("'`,=])(#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?)\b|\b(?:rgba?|hsla?)\(/;
export const focusRing =
  /\bfocus(?:-visible|-within)?:(?:ring|outline)(?!-none\b|-hidden\b|-0\b)(?:-[\w./[\]()%-]+)?/;
const drawnOutline = /\boutline\s*:(?!\s*(?:none|0|inherit|unset)\b)/;
export const noRoom =
  /\b(?:px|pl|pr|p)-0\b(?![^"'`]*-m[xlr]?-)[^"'`]*\bborder(?!-0\b)|\bborder(?!-0\b)[^"'`]*\b(?:px|pl|pr)-0\b(?![^"'`]*-m[xlr]?-)/;
const shellImport = /import\s*{[^}]*\bAppShell\b[^}]*}\s*from\s*["']@jaetask\/toolkit\/suite["']/s;

function files(dir: string): string[] {
  let out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out = out.concat(files(path));
    else out.push(path);
  }
  return out;
}

export function check(dirs: string[], root = process.cwd()): Finding[] {
  const found: Finding[] = [];
  let shell = false;
  for (const file of dirs.flatMap((d) => files(d))) {
    const ext = extname(file);
    if (!CODE.has(ext) && !STYLE.has(ext) && !PAGE.has(ext)) continue;
    const text = readFileSync(file, "utf8");
    const rel = relative(root, file);
    if (CODE.has(ext) && shellImport.test(text)) shell = true;
    text.split("\n").forEach((line, i) => {
      if (line.includes("toolkit-guard-allow")) return;
      const at = { file: rel, line: i + 1 };
      if (CODE.has(ext)) {
        const kit = ownKit.exec(line);
        if (kit)
          found.push({
            ...at,
            rule: "own-kit",
            message: `${kit[1]} is a toolkit component: import it from @jaetask/toolkit/suite.`,
          });
        const raw = rawControl.exec(line);
        if (raw?.[1])
          found.push({
            ...at,
            rule: "toolkit-controls",
            message: `A raw <${raw[1]}> is the browser's own: use ${CONTROL[raw[1]]} from @jaetask/toolkit/ui.`,
          });
        if (colourByName.test(line))
          found.push({
            ...at,
            rule: "colour-swatches",
            message:
              "A colour is chosen from swatches, never a name: use ProjectIconPicker from @jaetask/toolkit/suite.",
          });
      }
      const ring = CODE.has(ext) ? focusRing.exec(line) : null;
      if (ring || (STYLE.has(ext) && drawnOutline.test(line)))
        found.push({
          ...at,
          rule: "no-focus-rings",
          message: ring
            ? `${ring[0]} draws a ring round a focused part: the suite draws none. Remove it.`
            : "An outline draws a ring round a part: the suite draws none. Remove it.",
        });
      if (CODE.has(ext) && noRoom.test(line) && !/-m[xlr]?-\d/.test(line))
        found.push({
          ...at,
          rule: "room-inside",
          message:
            "A box with a border and no side padding puts its text against the edge. Give it padding and pull it back with a negative margin, such as px-3 -mx-3.",
        });
      if ((CODE.has(ext) || STYLE.has(ext)) && colour.test(line))
        found.push({
          ...at,
          rule: "tokens-only",
          message: "Use a toolkit token (var(--tk-…)) instead of a literal colour.",
        });
    });
  }
  if (!shell)
    found.push({
      file: dirs.join(", "),
      line: 0,
      rule: "shell-present",
      message: "No page imports AppShell from @jaetask/toolkit: every app opens in the shell.",
    });
  return found;
}

const isMain =
  !!process.argv[1] &&
  realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isMain) {
  const dirs = process.argv.slice(2);
  const found = check(dirs.length ? dirs : ["src"]);
  for (const f of found) console.error(`${f.file}:${f.line}  ${f.rule}  ${f.message}`);
  if (found.length) {
    console.error(`toolkit-guard: ${found.length} finding(s).`);
    process.exit(1);
  }
  console.log("toolkit-guard: clean.");
}
