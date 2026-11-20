import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { knownService, linkHost, ServiceIcon, service } from "./index.js";

test("a link is named by its site", () => {
  assert.equal(linkHost("https://www.youtube.com/watch?v=abc"), "youtube.com");
  assert.equal(linkHost("https://m.youtube.com/watch?v=abc"), "youtube.com");
  assert.equal(linkHost("not an address"), "");
  assert.equal(knownService("https://youtu.be/abc"), "YouTube");
  assert.equal(knownService("https://example.com/a"), "");
  assert.equal(service("https://github.com/a/b/pull/7"), "GitHub");
  assert.equal(service("https://example.com/a"), "example.com");
  assert.equal(service("notes"), "notes");
});

test("a known site has its own icon, any other a plain link", () => {
  const youtube = renderToStaticMarkup(<ServiceIcon url="https://youtu.be/abc" />);
  const other = renderToStaticMarkup(<ServiceIcon url="https://example.com" />);
  assert.match(youtube, /brand-youtube/);
  assert.match(youtube, /text-red-600/);
  assert.doesNotMatch(other, /brand-/);
  assert.match(other, /text-muted-foreground/);
});
