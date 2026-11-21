#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { extname, join } from "node:path";

const require = createRequire(join(process.cwd(), "package.json"));
let ts;
try {
  ts = require("typescript");
} catch {
  ts = undefined;
}

const BASELINE = ".agents/guardrails/comments.json";
const SCRIPT = new Set([".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"]);
const STYLE = new Set([".css", ".scss"]);
const HASH = new Set([".sh", ".py", ".yml", ".yaml"]);
const DIRECTIVE =
  /^(?:\/\/|\/\*+|#)\s*(?:biome-ignore|@ts-|eslint-|prettier-ignore|toolkit-guard-allow|istanbul |c8 |v8 |@vite-ignore|webpackChunkName|#__PURE__|@__PURE__|\/ <reference|!|@license|@preserve|Copyright|SPDX-|\/\/\/ script|\/\/\/$|requires-python|dependencies =|shellcheck |yaml-language-server|noqa|type: ignore|pragma)/i;

const LICENCE = /\b(?:copyright|SPDX-License|MIT License|licensed under)\b/i;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const config = existsSync(BASELINE)
  ? JSON.parse(readFileSync(BASELINE, "utf8"))
  : { skip: [], files: {} };
const skipped = (file) => (config.skip ?? []).some((prefix) => file.startsWith(prefix));

function scriptComments(text, file) {
  const kind = /\.[mc]?[jt]sx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const seen = new Map();
  const lones = [];
  const take = (ranges) => {
    for (const r of ranges ?? []) seen.set(r.pos, { pos: r.pos, end: r.end });
  };
  const visit = (node) => {
    if (node.kind === ts.SyntaxKind.JsxText) return;
    if (ts.isJsxExpression(node) && !node.expression) {
      lones.push({ pos: node.getStart(source), end: node.getEnd() });
    }
    take(ts.getLeadingCommentRanges(text, node.getFullStart()));
    take(ts.getTrailingCommentRanges(text, node.getEnd()));
    for (const child of node.getChildren(source)) visit(child);
  };
  visit(source);
  return [...seen.values()].map((c) => ({
    ...c,
    jsx: lones.find((l) => l.pos <= c.pos && c.end <= l.end),
  }));
}

function blockComments(text) {
  const found = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"' || ch === "'") {
      i += 1;
      while (i < text.length && text[i] !== ch && text[i] !== "\n") i += text[i] === "\\" ? 2 : 1;
      i += 1;
    } else if (ch === "/" && text[i + 1] === "*") {
      const close = text.indexOf("*/", i + 2);
      const end = close === -1 ? text.length : close + 2;
      found.push({ pos: i, end });
      i = end;
    } else i += 1;
  }
  return found;
}

function hashComments(text) {
  const found = [];
  let pos = 0;
  for (const line of text.split("\n")) {
    const at = /^\s*#/.test(line) ? line.indexOf("#") : -1;
    if (at >= 0) found.push({ pos: pos + at, end: pos + line.length });
    pos += line.length + 1;
  }
  return found;
}

export function commentsOf(file, text) {
  const ext = extname(file);
  const ranges = SCRIPT.has(ext)
    ? ts
      ? scriptComments(text, file)
      : []
    : STYLE.has(ext)
      ? blockComments(text)
      : HASH.has(ext)
        ? hashComments(text)
        : [];
  const found = ranges
    .map((r) => ({
      ...r,
      text: text.slice(r.pos, r.end),
      line: text.slice(0, r.pos).split("\n").length,
      lines: text.slice(r.pos, r.end).split("\n").length,
      own: /^\s*$/.test(text.slice(text.lastIndexOf("\n", r.pos - 1) + 1, r.pos)),
    }))
    .sort((a, b) => a.pos - b.pos);
  const licensed = new Set();
  for (let i = 0; i < found.length; i += 1) {
    if (!LICENCE.test(found[i].text)) continue;
    licensed.add(i);
    for (let j = i - 1; j >= 0 && found[j].line + found[j].lines === found[j + 1].line; j -= 1) {
      licensed.add(j);
    }
    for (
      let j = i + 1;
      j < found.length && found[j - 1].line + found[j - 1].lines === found[j].line;
      j += 1
    ) {
      licensed.add(j);
    }
  }
  return found.filter((c, i) => !licensed.has(i) && !DIRECTIVE.test(c.text));
}

function strip(file, text) {
  const found = commentsOf(file, text).sort((a, b) => b.pos - a.pos);
  let out = text;
  for (const c of found) {
    let [from, to] = c.jsx ? [c.jsx.pos, c.jsx.end] : [c.pos, c.end];
    const lineStart = out.lastIndexOf("\n", from - 1) + 1;
    const lineEnd = out.indexOf("\n", to) === -1 ? out.length : out.indexOf("\n", to);
    const before = out.slice(lineStart, from);
    const after = out.slice(to, lineEnd);
    if (/^\s*$/.test(before) && /^\s*$/.test(after)) {
      from = lineStart;
      to = Math.min(out.length, lineEnd + 1);
    } else if (/^\s*$/.test(after)) {
      from -= before.length - before.trimEnd().length;
    }
    out = out.slice(0, from) + out.slice(to);
  }
  return out;
}

if (!ts) console.error("comments: no typescript package here, so script files are not read.");

const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter((f) => f && existsSync(f) && !skipped(f))
  .filter((f) => SCRIPT.has(extname(f)) || STYLE.has(extname(f)) || HASH.has(extname(f)));

const counts = {};
const all = [];
for (const file of files) {
  const found = commentsOf(file, readFileSync(file, "utf8"));
  if (found.length) counts[file] = found.length;
  for (const c of found) all.push({ file, ...c });
}
const total = Object.values(counts).reduce((a, b) => a + b, 0);

if (flag("--strip")) {
  const only = args.filter((a) => !a.startsWith("--"));
  let gone = 0;
  for (const file of Object.keys(counts)) {
    if (only.length && !only.some((prefix) => file.startsWith(prefix))) continue;
    writeFileSync(file, strip(file, readFileSync(file, "utf8")));
    gone += counts[file];
  }
  console.log(`comments: deleted ${gone}. Run the formatter and the checks.`);
} else if (flag("--list")) {
  for (const c of all) console.log(JSON.stringify({ file: c.file, line: c.line, text: c.text }));
} else if (flag("--estimate")) {
  const lines = all.reduce((n, c) => n + (c.own ? c.lines : 0), 0);
  const trailing = all.filter((c) => !c.own).length;
  console.log(
    `${total} comments in ${Object.keys(counts).length} files: ${lines} whole lines to shed, and ${trailing} comments that share a line with code.`,
  );
} else if (flag("--update")) {
  const next = {};
  for (const [file, n] of Object.entries(counts)) {
    const allowed = config.files?.[file];
    next[file] = flag("--init") || allowed === undefined ? n : Math.min(n, allowed);
    if (!flag("--init") && allowed === undefined) {
      console.error(`${file}: ${n} new comments. A baseline only goes down.`);
      process.exitCode = 1;
    }
  }
  if (!process.exitCode) {
    writeFileSync(
      BASELINE,
      `${JSON.stringify({ skip: config.skip ?? [], files: next }, null, 2)}\n`,
    );
    console.log(`comments: baseline is ${Object.values(next).reduce((a, b) => a + b, 0)}.`);
  }
} else {
  let failed = 0;
  for (const [file, n] of Object.entries(counts)) {
    const allowed = config.files?.[file] ?? 0;
    if (n <= allowed) continue;
    failed += 1;
    console.error(
      `${file}: ${n} comments, ${allowed} allowed. Code is law: say it in the code, a name or a test. A decision goes in docs/adr.`,
    );
  }
  const allowedTotal = Object.values(config.files ?? {}).reduce((a, b) => a + b, 0);
  if (failed) process.exit(1);
  console.log(
    total < allowedTotal
      ? `comments: ${total} left, ${allowedTotal} allowed. Lower the baseline: node .agents/guardrails/check-comments.mjs --update`
      : `comments: ${total} left.`,
  );
}
