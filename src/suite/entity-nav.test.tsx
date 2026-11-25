import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { type Entity, EntityNav } from "./index.js";

const entities: Entity[] = [
  {
    id: "a",
    name: "Alpha",
    href: "/p/a",
    mark: <i>A</i>,
    links: [
      { key: "intake", label: "Intake", href: "/p/a/intake" },
      { key: "board", label: "Board", href: "/p/a/board", current: true },
      {
        key: "features",
        label: "Features",
        href: "/p/a/features",
        openNested: true,
        nested: () => <span>One feature</span>,
      },
    ],
  },
  { id: "b", name: "Beta", href: "/p/b", mark: <i>B</i>, links: [] },
];

test("each entity is a row that opens into its own links, the chosen one open", () => {
  const html = renderToStaticMarkup(
    <EntityNav
      label="Projects"
      entities={entities}
      collapsed={false}
      selected="a"
      storageKey="t"
    />,
  );
  assert.match(html, /aria-label="Projects"/);
  assert.match(html, /aria-label="Alpha"/);
  assert.match(html, /aria-label="Toggle Alpha"/);
  assert.match(html, /aria-label="Toggle Beta"/);
  assert.match(html, /href="\/p\/a\/intake"/);
  assert.match(html, /aria-current="page"[^>]*>(<[^>]+>)*Board|Board/);
  assert.match(html, /aria-label="Toggle Alpha features"/);
  assert.match(html, /One feature/);
});

test("reordering shows a drag handle and arrows only when the app can move entities", () => {
  const still = renderToStaticMarkup(
    <EntityNav
      label="Brands"
      entities={entities}
      collapsed={false}
      selected={null}
      storageKey="t"
    />,
  );
  assert.doesNotMatch(still, /Drag to reorder/);
  assert.doesNotMatch(still, /Move Alpha up/);
  const movable = renderToStaticMarkup(
    <EntityNav
      label="Projects"
      entities={entities}
      collapsed={false}
      selected={null}
      storageKey="t"
      onMove={() => {}}
    />,
  );
  assert.match(movable, /Drag to reorder Alpha/);
  assert.match(movable, /aria-label="Move Alpha up"[^>]*disabled/);
  assert.match(movable, /aria-label="Move Beta down"[^>]*disabled/);
});

test("a nested list is drawn only while it is open, and an empty list shows its note", () => {
  const closed = renderToStaticMarkup(
    <EntityNav
      label="Projects"
      entities={entities}
      collapsed={false}
      selected="b"
      storageKey="t"
    />,
  );
  assert.doesNotMatch(closed, /One feature/);
  const none = renderToStaticMarkup(
    <EntityNav
      label="Brands"
      entities={[]}
      collapsed={false}
      selected={null}
      storageKey="t"
      empty={<p>No brands yet</p>}
    />,
  );
  assert.match(none, /No brands yet/);
});
