// Renders the demo pages to demo/*.html (static markup and styles.css), for screenshots and review.
import { readFileSync, writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AppShell,
  Avatar,
  Card,
  Chip,
  ChipPicker,
  EditFrame,
  EditLink,
  EmptyCard,
  Input,
  Kicker,
  ListCard,
  ListRow,
  PageBody,
  PageLink,
  Panel,
  Row,
  SideLink,
  SideSection,
  StatusDot,
  Textarea,
  ToolkitProvider,
} from "../src/index.js";

const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const icon = (d: string) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden
  >
    <path d={d} />
  </svg>
);

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <AppShell
      app={{ name: "Tasks" }}
      title={title}
      nav={[
        {
          href: "/today",
          label: "Today",
          icon: icon("M12 3v2M12 19v2M3 12h2M19 12h2M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0"),
        },
        { href: "/inbox", label: "Inbox", icon: icon("M4 6h16M4 12h16M4 18h10") },
        { href: "/review", label: "Review", icon: icon("M4 4h16v16H4zM9 12l2 2 4-4") },
        { href: "/runs", label: "Runs", icon: icon("M4 12h4l3 7 3-14 3 7h3") },
      ]}
      groups={[
        {
          label: "Projects",
          href: "/projects",
          items: [
            {
              id: "web",
              href: "/p/web",
              label: "Website",
              avatar: <Avatar name="Website" colour="var(--tk-ink)" />,
              open: (
                <>
                  <SideSection label="Board">
                    <SideLink href="/p/web" label="Overview" />
                    <SideLink href="/p/web/ready" label="Ready" status="in-progress" />
                    <SideLink href="/p/web/doing" label="Doing" status="in-progress" />
                    <SideLink href="/p/web/done" label="Done" status="done" />
                  </SideSection>
                  <SideSection label="Setup">
                    <SideLink
                      href="/p/web/profile"
                      label="Profile"
                      line="Name, prefix, kind"
                      current
                    />
                  </SideSection>
                </>
              ),
            },
            { id: "app", href: "/p/app", label: "Mobile app", status: "done" },
            { id: "docs", href: "/p/docs", label: "Docs refresh", status: "not-started" },
          ],
        },
      ]}
      settingsHref="/settings"
      onSearch={() => {}}
    >
      {children}
    </AppShell>
  );
}

const read = (
  <Shell title="Website · Profile">
    <PageBody title="Profile" line="What this project is and how its tickets are named.">
      <Panel
        id="identity"
        title="Identity"
        line="The name and prefix every ticket carries."
        action={<EditLink to="/p/web/profile/edit/identity" />}
      >
        <Card>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: 16,
            }}
          >
            <div style={{ display: "grid", gap: 4 }}>
              <Kicker>Name</Kicker>Website
            </div>
            <div style={{ display: "grid", gap: 4 }}>
              <Kicker>Prefix</Kicker>WEB
            </div>
            <div style={{ display: "grid", gap: 4 }}>
              <Kicker>Kind</Kicker>Product
            </div>
          </div>
        </Card>
      </Panel>
      <Panel
        id="milestones"
        title="Milestones"
        line="Each one opens its own page."
        action={<PageLink to="/p/web/milestones/new">Add</PageLink>}
      >
        <ListCard>
          <ListRow to="/m/1" aside={<StatusDot status="done" />}>
            Launch landing page<span className="tk-muted">12 tickets</span>
          </ListRow>
          <ListRow to="/m/2" aside={<StatusDot status="in-progress" />}>
            Pricing and checkout<span className="tk-muted">8 tickets</span>
          </ListRow>
          <ListRow to="/m/3" aside={<StatusDot status="not-started" />}>
            Help centre<span className="tk-muted">No tickets yet</span>
          </ListRow>
        </ListCard>
      </Panel>
      <Panel
        id="labels"
        title="Labels"
        line="Words agents use to sort tickets."
        action={<EditLink to="/p/web/profile/edit/labels" />}
      >
        <Card>
          <div className="tk-chips">
            <Chip>frontend</Chip>
            <Chip>copy</Chip>
            <Chip>bug</Chip>
          </div>
        </Card>
        <EmptyCard
          text="No saved views yet. Save a filter from the board to see it here."
          action={<PageLink to="/p/web">Open board</PageLink>}
        />
      </Panel>
    </PageBody>
  </Shell>
);

const edit = (
  <Shell title="Website · Edit identity">
    <EditFrame
      title="Edit identity"
      line="The name and prefix every ticket carries."
      backTo="/p/web/profile"
      onSave={() => {}}
    >
      <Row title="Name" line="Shown in the sidebar and on every page." htmlFor="name">
        <Input id="name" defaultValue="Website" />
      </Row>
      <Row title="Prefix" line="Two to five capitals, used in ticket ids." htmlFor="prefix">
        <Input id="prefix" defaultValue="WEB" />
      </Row>
      <Row title="Kind" line="Pick one.">
        <ChipPicker
          label="Kind"
          value="product"
          onChange={() => {}}
          options={[
            { id: "product", name: "Product" },
            { id: "client", name: "Client" },
            { id: "internal", name: "Internal" },
          ]}
        />
      </Row>
      <Row title="About" line="One or two lines for agents." htmlFor="about">
        <Textarea id="about" defaultValue="The public site: landing, pricing, checkout and help." />
      </Row>
    </EditFrame>
  </Shell>
);

const page = (title: string, node: React.ReactNode, dark = false) => `<!doctype html>
<html lang="en"${dark ? ' data-theme="dark"' : ""}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
<style>body{margin:0}${css}</style></head><body>${renderToStaticMarkup(
  <ToolkitProvider location="/p/web/profile">{node}</ToolkitProvider>,
)}</body></html>`;

writeFileSync("demo/read.html", page("Toolkit · read page", read));
writeFileSync("demo/edit.html", page("Toolkit · edit page", edit));
writeFileSync("demo/read-dark.html", page("Toolkit · read page, dark", read, true));
console.log("demo/read.html, demo/edit.html, demo/read-dark.html");
