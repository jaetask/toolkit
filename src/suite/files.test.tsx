import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AttachButton, FileChip, fileSize, VideoFigure } from "./index.js";

test("a size reads as bytes, kilobytes or megabytes", () => {
  assert.equal(fileSize(812), "812 B");
  assert.equal(fileSize(34_000), "33 KB");
  assert.equal(fileSize(1_300_000), "1.2 MB");
});

test("the paperclip is named for what it attaches and holds a hidden file chooser", () => {
  const html = renderToStaticMarkup(<AttachButton onFiles={() => {}} shortcut />);
  assert.match(html, /<input[^>]*type="file"[^>]*multiple/);
  assert.match(html, /<button[^>]*aria-label="Attach images, files, or videos"/);
  const images = renderToStaticMarkup(
    <AttachButton onFiles={() => {}} label="Attach an image" accept="image/png" />,
  );
  assert.match(images, /accept="image\/png"/);
});

test("a file is a chip that downloads; a video plays in place", () => {
  const chip = renderToStaticMarkup(
    <FileChip name="build.log" size={2048} href="/api/files/fl1" action={<b>x</b>} />,
  );
  assert.match(chip, /<a href="\/api\/files\/fl1" download="build.log"/);
  assert.match(chip, /2 KB/);
  assert.match(chip, /<b>x<\/b>/);
  const video = renderToStaticMarkup(
    <VideoFigure name="demo.mp4" size={5_000_000} src="/api/files/fl2" />,
  );
  assert.match(video, /<video[^>]*controls[^>]*src="\/api\/files\/fl2"/);
  assert.match(video, /demo.mp4/);
});
