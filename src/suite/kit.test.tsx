import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AppShell,
  Board,
  Column,
  Comment,
  Composer,
  EditFrame,
  EditLink,
  Facts,
  LinkProvider,
  ListCard,
  ListRow,
  PageBody,
  Panel,
  Reactions,
  Row,
  SideLink,
  SideSection,
  StatusDot,
  Thread,
  safeFrom,
  withFrom,
} from "./index.js";

const at = (path: string, node: React.ReactNode) =>
  renderToStaticMarkup(<LinkProvider location={path}>{node}</LinkProvider>);

test("the shell draws the mark, nav, groups with icons, and Settings", () => {
  const html = at(
    "/today",
    <AppShell
      app={{ name: "Tasks" }}
      nav={[{ href: "/today", label: "Today", current: true, count: 2 }]}
      bottom={[{ href: "/archive", label: "Archive" }]}
      groups={[
        {
          label: "Projects",
          items: [
            {
              id: "w",
              href: "/p/w",
              label: "Website",
              defaultOpen: true,
              icon: {
                version: 1,
                kind: "library",
                library: "tabler",
                name: "rocket",
                color: "green",
              },
              children: (
                <SideSection label="Board">
                  <SideLink href="/p/w/doing" label="Doing" status="in-progress" current />
                </SideSection>
              ),
            },
            { id: "m", href: "/p/m", label: "Mobile", status: "done" },
          ],
        },
      ]}
      settingsHref="/settings"
      title="Today"
    >
      <p>page</p>
    </AppShell>,
  );
  assert.match(html, /class="tk-root tk-shell"/);
  assert.match(html, /class="tk-nav-item" aria-current="page"/);
  assert.match(html, /<span class="tk-group-label">Projects<\/span>/);
  assert.match(html, /tk-item-icon/);
  assert.match(html, /data-state="open"/);
  assert.match(html, /class="tk-side-link" aria-current="page"/);
  assert.match(html, /aria-label="Collapse Website"/);
  assert.match(html, /More pages/);
  assert.match(html, /href="\/settings"[^>]*>Settings</);
  assert.doesNotMatch(html, /<select/);
});

test("a panel's Edit button carries the way back; rows, status and a wide board", () => {
  const html = at(
    "/p/w/profile",
    <PageBody title="Profile" wide>
      <Panel id="identity" title="Identity" action={<EditLink to="/p/w/profile/edit" />}>
        <ListCard>
          <ListRow to="/m/1" aside={<StatusDot status="in-progress" />} blocked>
            Launch
          </ListRow>
        </ListCard>
        <Facts items={[{ label: "Prefix", value: "WEB" }]} />
      </Panel>
      <Board>
        {["a", "b"].map((id) => (
          <Column key={id} id={id} title={id} onDrop={() => {}} />
        ))}
      </Board>
    </PageBody>,
  );
  assert.match(html, /class="tk-page" data-wide="true"/);
  assert.match(html, /href="\/p\/w\/profile\/edit\?from=%2Fp%2Fw%2Fprofile"/);
  assert.match(html, /In progress/);
  assert.match(html, />Blocked</);
  assert.equal(html.match(/class="tk-column"/g)?.length, 2);
});

test("an edit page has Back, labelled rows, Cancel and Save on the ported Button", () => {
  const html = at(
    "/x",
    <EditFrame title="Edit identity" backTo="/p/w/profile" onSave={() => {}}>
      <Row title="Name" htmlFor="name">
        <span />
      </Row>
    </EditFrame>,
  );
  assert.match(html, />Back</);
  assert.match(html, />Cancel</);
  assert.match(html, />Save</);
  assert.match(html, /data-variant="primary"/);
});

test("threads, reactions and the composer", () => {
  const html = at(
    "/x",
    <>
      <Thread>
        <Comment
          author="Agent"
          reactions={<Reactions items={[{ emoji: "👍", count: 2, mine: true }]} />}
        >
          Done.
        </Comment>
      </Thread>
      <Composer label="Reply" value="" onChange={() => {}} onSubmit={() => {}} />
    </>,
  );
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /aria-label="Reply"/);
});

test("only same-origin paths are followed back", () => {
  assert.equal(safeFrom("/p/w"), "/p/w");
  assert.equal(safeFrom("//evil.example"), null);
  assert.equal(withFrom("/a?x=1", "/b"), "/a?x=1&from=%2Fb");
});
