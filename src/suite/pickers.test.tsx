import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PropertyPicker, RailRow } from "./index.js";

test("a property picker draws its row and keeps the list closed until asked", () => {
  const html = renderToStaticMarkup(
    <PropertyPicker
      label="Priority"
      placeholder="Set priority..."
      hint="P"
      chosen={["high"]}
      choices={[
        { id: "none", name: "No priority" },
        { id: "high", name: "High" },
      ]}
      onPick={() => {}}
    >
      <RailRow muted icon={<span>!</span>}>
        High
      </RailRow>
    </PropertyPicker>,
  );
  assert.match(html, /<button[^>]*aria-haspopup="dialog"/);
  assert.match(html, /High/);
  assert.match(html, /text-muted-foreground/);
  assert.doesNotMatch(html, /Set priority/);
});

test("a disabled picker cannot be opened", () => {
  const html = renderToStaticMarkup(
    <PropertyPicker
      label="Labels"
      placeholder="Labels"
      chosen={[]}
      choices={[]}
      onPick={() => {}}
      many
      disabled
    >
      <RailRow>Add label</RailRow>
    </PropertyPicker>,
  );
  assert.match(html, /disabled/);
});
