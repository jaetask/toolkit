import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ago,
  EmptyLine,
  FilterMenu,
  IconAction,
  IconAvatar,
  InlineText,
  PageSection,
  RowMenu,
  Thumbs,
  WorkPage,
} from "./index.js";

test("a working page has one small title, its help behind a button, and its actions", () => {
  const html = renderToStaticMarkup(
    <WorkPage title="Backlog" help="Tickets wait here." action={<b>New ticket</b>}>
      <p>content</p>
    </WorkPage>,
  );
  assert.match(html, /<h1 class="tk-work-title">Backlog<\/h1>/);
  assert.match(html, /aria-label="About Backlog"/);
  assert.doesNotMatch(html, /Tickets wait here/);
  assert.match(html, /New ticket/);
});

test("a section has a heading that folds, a count and a plus", () => {
  const html = renderToStaticMarkup(
    <PageSection title="Steps" count="1 of 3" onAdd={() => {}} addLabel="Add a step">
      <p>one</p>
    </PageSection>,
  );
  assert.match(html, /aria-label="Steps"/);
  assert.match(html, /1 of 3/);
  assert.match(html, /aria-label="Add a step"/);
  assert.match(html, /aria-expanded="true"/);
});

test("a name is shown as text until it is clicked, and as a box while it is edited", () => {
  const shown = renderToStaticMarkup(
    <InlineText value="Coder" label="Rename Coder" onSave={() => {}} />,
  );
  assert.match(shown, /Coder<\/button>/);
  const edited = renderToStaticMarkup(
    <InlineText value="Coder" label="Rename Coder" editing onSave={() => {}} />,
  );
  assert.match(edited, /<input[^>]*aria-label="Rename Coder"/);
});

test("a row's menu is one quiet button named for the row", () => {
  const html = renderToStaticMarkup(
    <RowMenu label="Label bug" items={[{ label: "Remove", onSelect: () => {} }]} />,
  );
  assert.match(html, /aria-label="Label bug"/);
});

test("an avatar shows an icon, an emoji, or the first letter of the name", () => {
  assert.match(renderToStaticMarkup(<IconAvatar name="Codex" icon="robot" />), /<svg/);
  assert.match(renderToStaticMarkup(<IconAvatar name="Codex" icon="🤖" />), /🤖/);
  assert.match(renderToStaticMarkup(<IconAvatar name="codex" />), />C</);
});

test("a filter in use shows as a chip that can be removed", () => {
  const html = renderToStaticMarkup(
    <FilterMenu
      filters={[
        { id: "actor", label: "Actor", options: [{ id: "a1", name: "Codex" }] },
        { id: "type", label: "Type", options: [{ id: "bug", name: "Bug" }] },
      ]}
      values={{ actor: ["a1"] }}
      onChange={() => {}}
    />,
  );
  assert.match(html, /aria-label="Filter"/);
  assert.match(html, /data-filter="actor"/);
  assert.match(html, /Codex/);
  assert.match(html, /aria-label="Remove the actor filter"/);
  assert.doesNotMatch(html, /data-filter="type"/);
});

test("an empty list says so in one line", () => {
  assert.match(renderToStaticMarkup(<EmptyLine>Nothing here.</EmptyLine>), /tk-empty-line/);
});

test("a thumbnail opens the image and has a small remove button", () => {
  const html = renderToStaticMarkup(
    <Thumbs items={[{ id: "i1", src: "data:,", alt: "shot.png" }]} onRemove={() => {}} />,
  );
  assert.match(html, /aria-label="Open shot.png"/);
  assert.match(html, /aria-label="Remove shot.png"/);
  assert.doesNotMatch(html, />Remove</);
});

test("ago says how long ago in a few letters", () => {
  const now = Date.parse("2026-11-21T12:00:00Z");
  assert.equal(ago("2026-11-21T11:59:40Z", now), "now");
  assert.equal(ago("2026-11-21T11:15:00Z", now), "45m ago");
  assert.equal(ago("2026-11-21T09:00:00Z", now), "3h ago");
  assert.equal(ago("2026-11-19T09:00:00Z", now), "2d ago");
  assert.equal(ago("2026-10-01T09:00:00Z", now), "7w ago");
});

test("a page action is an icon with its name for a label", () => {
  const html = renderToStaticMarkup(
    <IconAction label="New ticket" icon={<svg />} primary onClick={() => {}} />,
  );
  assert.match(html, /aria-label="New ticket"/);
  assert.doesNotMatch(html, />New ticket</);
});
