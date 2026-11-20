import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { IconCircleCheck, IconUsers } from "@tabler/icons-react";
import { PropertyPills, ViewToggle } from "./index.js";

test("the view buttons name each view and mark the chosen one", () => {
  const html = renderToStaticMarkup(
    <ViewToggle
      views={[
        { id: "actors", label: "Actors", Icon: IconUsers },
        { id: "status", label: "Status", Icon: IconCircleCheck },
      ]}
      value="status"
      onChange={() => {}}
    />,
  );
  assert.match(html, /aria-label="Board view"/);
  assert.match(html, /aria-label="Actors view"/);
  assert.match(
    html,
    /aria-label="Status view"[^>]*bg-primary|bg-primary[^>]*aria-label="Status view"/,
  );
});

test("the pills that are on are marked on", () => {
  const html = renderToStaticMarkup(
    <PropertyPills
      label="Display properties"
      options={[
        ["id", "ID"],
        ["labels", "Labels"],
      ]}
      value={["labels"]}
      onChange={() => {}}
    />,
  );
  assert.match(html, /aria-label="Display properties"/);
  assert.match(html, /data-state="on"[^>]*>Labels|aria-pressed="true"[^>]*>Labels/);
  assert.match(html, /data-state="off"[^>]*>ID|aria-pressed="false"[^>]*>ID/);
});
