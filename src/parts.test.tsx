import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ActivityRow,
  AppShell,
  Avatar,
  Board,
  CenteredPage,
  Chip,
  ChipMultiPicker,
  Column,
  Comment,
  Composer,
  Facts,
  FileButton,
  FilterBar,
  Inline,
  ListCard,
  ListRow,
  Notice,
  Reactions,
  SearchInput,
  Tabs,
  Thread,
  Thumbs,
  ToolkitProvider,
} from "./index.js";

const html = (node: React.ReactNode) =>
  renderToStaticMarkup(<ToolkitProvider location="/x">{node}</ToolkitProvider>);

test("a board of columns with kind chips, counts and draggable rows", () => {
  const out = html(
    <Board label="Board">
      <Column
        id="ready"
        title="Ready"
        kind={<Chip colour="blue">Agent</Chip>}
        count={1}
        onDrop={() => {}}
      >
        <ListRow dragId="t1" blocked>
          Fix login
        </ListRow>
      </Column>
      <Column id="done" title="Done" empty="Nothing done yet." />
    </Board>,
  );
  assert.match(out, /<section class="tk-board" aria-label="Board">/);
  assert.match(
    out,
    /<h3 id="ready-title" class="tk-column-title">Ready<\/h3><span class="tk-chip" data-colour="blue">Agent<\/span><span class="tk-count">1<\/span>/,
  );
  assert.match(out, /<li class="tk-list-row" data-blocked="true" draggable="true">/);
  assert.match(out, /data-colour="amber">Blocked</);
  assert.match(out, /class="tk-column-empty">Nothing done yet.</);
});

test("a row can be any element, and a list card can match", () => {
  const out = html(
    <ListCard as="div">
      <ListRow as="div">Plain</ListRow>
    </ListCard>,
  );
  assert.match(
    out,
    /^<div class="tk-list"><div class="tk-list-row"><div class="tk-list-body">Plain<\/div><\/div><\/div>$/,
  );
});

test("a thread shows one level of replies, reactions and an activity line", () => {
  const out = html(
    <Thread label="Comments">
      <Comment
        author="Agent"
        time="2 min ago"
        reactions={<Reactions items={[{ emoji: "👍", count: 2, mine: true }]} />}
        replies={
          <Comment author="Owner" replies={<Comment author="Deep">too deep</Comment>}>
            Thanks
          </Comment>
        }
      >
        Done the first pass.
      </Comment>
      <ActivityRow time="1 min ago" action={<button type="button">Undo</button>}>
        Moved to Done
      </ActivityRow>
    </Thread>,
  );
  assert.match(out, /<ol class="tk-thread" aria-label="Comments">/);
  assert.match(out, /tk-comment-author">Agent</);
  assert.match(out, /aria-pressed="true" aria-label="👍 2"/);
  assert.match(out, /<ol class="tk-replies"><li class="tk-comment" data-reply="true">/);
  assert.doesNotMatch(out, /too deep/);
  assert.match(out, /tk-activity-text">Moved to Done</);
});

test("tabs as buttons or links, with counts", () => {
  const buttons = html(
    <Tabs
      label="View"
      value="open"
      options={[
        { id: "open", name: "Open", count: 3 },
        { id: "done", name: "Done" },
      ]}
    />,
  );
  assert.match(buttons, /role="tablist"/);
  assert.match(
    buttons,
    /role="tab" class="tk-tab" aria-selected="true">Open<span class="tk-count">3<\/span>/,
  );
  const links = html(
    <Tabs
      label="View"
      value="done"
      options={[
        { id: "open", name: "Open", href: "/open" },
        { id: "done", name: "Done", href: "/done" },
      ]}
    />,
  );
  assert.match(links, /<nav class="tk-tabs" aria-label="View">/);
  assert.match(links, /href="\/done" class="tk-tab" aria-current="page"/);
});

test("pick many, composer, filter bar, facts, notice, file button and thumbs", () => {
  const out = html(
    <>
      <ChipMultiPicker
        label="Labels"
        value={["bug"]}
        options={[
          { id: "bug", name: "bug" },
          { id: "copy", name: "copy" },
        ]}
        onChange={() => {}}
      />
      <Composer label="Reply" value="" onChange={() => {}} onSubmit={() => {}} />
      <FilterBar>
        <SearchInput value="" onChange={() => {}} />
      </FilterBar>
      <Facts items={[{ label: "Prefix", value: "WEB" }]} />
      <Notice tone="refused">Only the owner can do that.</Notice>
      <FileButton label="Add images" onFiles={() => {}} multiple />
      <Thumbs items={[{ id: "1", src: "/a.png", alt: "Mock-up" }]} onRemove={() => {}} />
      <Inline>
        <span>a</span>
      </Inline>
    </>,
  );
  assert.match(out, /aria-pressed="true">bug</);
  assert.match(out, /aria-pressed="false">copy</);
  assert.match(out, /<form class="tk-composer"><input class="tk-input" aria-label="Reply"/);
  assert.match(out, /data-variant="primary"[^>]*disabled=""/);
  assert.match(out, /class="tk-input tk-search" type="search"/);
  assert.match(out, /<dt class="tk-kicker">Prefix<\/dt><dd>WEB<\/dd>/);
  assert.match(out, /data-tone="refused" role="alert"/);
  assert.match(
    out,
    /type="file" hidden="" accept="image\/png,image\/jpeg,image\/webp" multiple=""/,
  );
  assert.match(out, /aria-label="Remove Mock-up">Remove</);
  assert.match(out, /class="tk-inline"/);
});

test("avatars take an emoji and a named colour, with no inline style", () => {
  const out = html(<Avatar name="Website" emoji="🚀" colour="teal" />);
  assert.equal(
    out,
    '<span class="tk-avatar" data-colour="teal" data-emoji="true" aria-hidden="true">🚀</span>',
  );
});

test("nav counts, reorderable groups and the centred page", () => {
  const out = html(
    <AppShell
      app={{ name: "Tasks" }}
      nav={[{ href: "/inbox", label: "Inbox", count: 4 }]}
      groups={[
        { label: "Projects", onReorder: () => {}, items: [{ id: "a", href: "/a", label: "A" }] },
      ]}
    >
      x
    </AppShell>,
  );
  assert.match(out, /Inbox<\/span><span class="tk-count">4<\/span>/);
  assert.match(out, /<div class="tk-group-slot" draggable="true">/);
  assert.match(out, /aria-keyshortcuts="Alt\+ArrowUp Alt\+ArrowDown"/);
  const page = html(<CenteredPage title="Sign in">form</CenteredPage>);
  assert.match(
    page,
    /<main class="tk-root tk-centered"><section class="tk-panel tk-centered-panel"/,
  );
});
