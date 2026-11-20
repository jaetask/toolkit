import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AppShell,
  EditFrame,
  EditLink,
  EmptyCard,
  ListCard,
  ListRow,
  Panel,
  Row,
  SideLink,
  SideSection,
  StatusDot,
  safeFrom,
  ToolkitProvider,
  withFrom,
} from "./index.js";

const at = (path: string, node: React.ReactNode) =>
  renderToStaticMarkup(<ToolkitProvider location={path}>{node}</ToolkitProvider>);

test("the shell draws the mark, nav, groups and Settings", () => {
  const html = at(
    "/today",
    <AppShell
      app={{ name: "Tasks" }}
      nav={[{ href: "/today", label: "Today", current: true }]}
      groups={[
        {
          label: "Projects",
          items: [
            {
              id: "w",
              href: "/p/w",
              label: "Website",
              open: (
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
  assert.match(html, /<span class="tk-label">Tasks<\/span>/);
  assert.match(html, /class="tk-nav-item" aria-current="page"/);
  assert.match(html, /<span class="tk-group-label">Projects<\/span>/);
  assert.match(html, /class="tk-group-open"/);
  assert.match(html, /class="tk-side-link" aria-current="page"/);
  assert.match(html, /data-status="done"/);
  assert.match(html, /href="\/settings"[^>]*>Settings</);
  assert.match(html, /aria-label="Collapse sidebar"/);
});

test("bottom pages sit above Settings", () => {
  const html = at(
    "/archive",
    <AppShell
      app={{ name: "Tasks" }}
      nav={[]}
      bottom={[{ href: "/archive", label: "Archive", current: true }]}
      settingsHref="/settings"
    >
      x
    </AppShell>,
  );
  assert.match(html, /aria-label="More pages"><a href="\/archive"[^>]*aria-current="page"/);
  assert.ok(html.indexOf("Archive") < html.indexOf(">Settings<"));
});

test("an empty group says how to add the first item", () => {
  const html = at(
    "/",
    <AppShell
      app={{ name: "Tasks" }}
      nav={[]}
      groups={[{ label: "Projects", items: [], empty: "Create your first project" }]}
    >
      x
    </AppShell>,
  );
  assert.match(html, /tk-side-empty">Create your first project/);
});

test("a panel's Edit button carries the way back", () => {
  const html = at(
    "/p/w/profile",
    <Panel
      id="identity"
      title="Identity"
      line="Name and prefix"
      action={<EditLink to="/p/w/profile/edit" />}
    >
      <ListCard>
        <ListRow to="/m/1" aside={<StatusDot status="in-progress" />}>
          Launch
        </ListRow>
      </ListCard>
      <EmptyCard text="No labels yet." />
    </Panel>,
  );
  assert.match(html, /<section id="identity" aria-labelledby="identity-title" class="tk-panel">/);
  assert.match(html, /href="\/p\/w\/profile\/edit\?from=%2Fp%2Fw%2Fprofile"[^>]*>Edit</);
  assert.match(html, /href="\/m\/1\?from=%2Fp%2Fw%2Fprofile"/);
  assert.match(html, /In progress/);
  assert.match(html, /class="tk-empty"><p>No labels yet.<\/p>/);
});

test("an edit page has Back, labelled rows, Cancel and Save", () => {
  const html = at(
    "/p/w/profile/edit",
    <EditFrame title="Edit identity" backTo="/p/w/profile" onSave={() => {}}>
      <Row title="Name" line="Shown everywhere" htmlFor="name">
        <input id="name" />
      </Row>
    </EditFrame>,
  );
  assert.match(html, /href="\/p\/w\/profile"[^>]*>Back</);
  assert.match(html, /<label for="name" class="tk-row-title">Name<\/label>/);
  assert.match(html, /href="\/p\/w\/profile"[^>]*>Cancel</);
  assert.match(html, /data-variant="primary"[^>]*>Save</);
});

test("an edit page that saves as you go shows Done", () => {
  const html = at(
    "/",
    <EditFrame title="Labels" backTo="/x">
      <span />
    </EditFrame>,
  );
  assert.match(html, />Done</);
  assert.doesNotMatch(html, />Save</);
});

test("only same-origin paths are followed back", () => {
  assert.equal(safeFrom("/p/w"), "/p/w");
  assert.equal(safeFrom("//evil.example"), null);
  assert.equal(safeFrom("https://evil.example"), null);
  assert.equal(safeFrom("/\\evil"), null);
  assert.equal(withFrom("/a?x=1", "/b"), "/a?x=1&from=%2Fb");
});
