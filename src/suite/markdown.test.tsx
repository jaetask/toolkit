import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MarkdownText } from "./index.js";

const html = (content: string) => renderToStaticMarkup(<MarkdownText content={content} />);

test("Markdown reads as headings, lists, code and links", () => {
  const out = html("# Plan\n\n- one\n- two\n\n`code` and [a link](https://example.com)");
  assert.match(out, /<h3[^>]*>Plan<\/h3>/);
  assert.match(out, /<ul[^>]*>\s*<li>one<\/li>/);
  assert.match(out, /<code[^>]*>code<\/code>/);
  assert.match(out, /<a href="https:\/\/example.com"[^>]*target="_blank"/);
});

test("a picture served by the app is shown; one from elsewhere is only a link", () => {
  const own = html("![shot](/api/files/fl3)");
  assert.match(own, /<img src="\/api\/files\/fl3" alt="shot"/);
  const other = html("![tracker](https://elsewhere.example/p.png)");
  assert.doesNotMatch(other, /<img/);
  assert.match(other, /<a href="https:\/\/elsewhere.example\/p.png"[^>]*>tracker<\/a>/);
  assert.doesNotMatch(html("![x](//elsewhere.example/p.png)"), /<img/);
});

test("HTML and scripts in the text are not run", () => {
  const out = html(
    "<script>alert(1)</script><img src=x onerror=alert(1)> [x](javascript:alert(1))",
  );
  assert.doesNotMatch(out, /<script|onerror|javascript:/);
});
