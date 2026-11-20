// The app shell: a light grey sidebar (app mark, nav with icons, small-caps groups of projects or
// entities with status dots, Settings at the bottom), a top bar, and the page. Every Kit app opens
// in this frame; the app passes data and the shell draws it.
import { type ReactNode, useEffect, useState } from "react";
import { Link } from "./link.js";
import { Dot, type Progress } from "./page.js";

export type NavItem = {
  href: string;
  label: string;
  /** A 16px line icon (for example from @tabler/icons-react). */
  icon?: ReactNode;
  current?: boolean;
};

export type GroupItem = {
  id: string;
  href: string;
  label: string;
  /** An image or Avatar. */
  avatar?: ReactNode;
  status?: Progress;
  /** Always shown open, in a warm grey block: for an app where only the selected item opens. */
  open?: ReactNode;
  /**
   * Sections the item expands into. Each item with children has its own expand button; several
   * can be open at once, and the shell remembers which ones were left open.
   */
  children?: ReactNode;
  /** Expanded until the person collapses it. */
  defaultOpen?: boolean;
  /** The row is the current page. */
  current?: boolean;
  onSelect?: () => void;
};

export type Group = {
  label: string;
  /** Where the group label links, for example the list of all projects. */
  href?: string;
  items: GroupItem[];
  /** Shown when the group has no items: one line on how to add the first. */
  empty?: ReactNode;
};

const STORAGE_KEY = "tk-sidebar-collapsed";

function useCollapsed(controlled?: boolean, onChange?: (collapsed: boolean) => void) {
  const [own, setOwn] = useState(false);
  useEffect(() => {
    if (controlled !== undefined) return;
    try {
      setOwn(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {}
  }, [controlled]);
  const collapsed = controlled ?? own;
  const set = (next: boolean) => {
    onChange?.(next);
    if (controlled !== undefined) return;
    setOwn(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {}
  };
  return [collapsed, set] as const;
}

const OPEN_KEY = "tk-sidebar-open";

/** Which expandable items are open, remembered per browser. */
function useOpenItems() {
  const [stored, setStored] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem(OPEN_KEY) ?? "{}");
      if (value && typeof value === "object") setStored(value);
    } catch {}
  }, []);
  const isOpen = (key: string, fallback: boolean) => stored[key] ?? fallback;
  const toggle = (key: string, fallback: boolean) =>
    setStored((prev) => {
      const next = { ...prev, [key]: !(prev[key] ?? fallback) };
      try {
        localStorage.setItem(OPEN_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  return { isOpen, toggle };
}

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-4-4" />
  </svg>
);
const CollapseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M9 4v16" />
  </svg>
);

/** A round avatar: an image, or the first letter on a colour. */
export function Avatar({ name, src, colour }: { name: string; src?: string; colour?: string }) {
  return (
    <span
      className="tk-avatar"
      style={colour ? { background: colour, color: "white" } : undefined}
      aria-hidden
    >
      {src ? (
        <img src={src} alt="" width={22} height={22} />
      ) : (
        (name.trim()[0] ?? "?").toUpperCase()
      )}
    </span>
  );
}

/** A small-caps label and its links, inside the selected group item. */
export function SideSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="tk-side-section">
      <span className="tk-group-label">{label}</span>
      {children}
    </div>
  );
}

/** A link inside the selected group item, with an optional line and status dot. */
export function SideLink({
  href,
  label,
  line,
  status,
  current,
}: {
  href: string;
  label: string;
  line?: string;
  status?: Progress;
  current?: boolean;
}) {
  return (
    <Link href={href} className="tk-side-link" aria-current={current ? "page" : undefined}>
      <span className="tk-side-link-text">
        <span className="tk-label">{label}</span>
        {line && <span className="tk-side-link-line">{line}</span>}
      </span>
      {status && <Dot status={status} />}
    </Link>
  );
}

function NavLink({ item }: { item: NavItem }) {
  return (
    <Link
      href={item.href}
      title={item.label}
      className="tk-nav-item"
      aria-current={item.current ? "page" : undefined}
    >
      {item.icon && <span className="tk-nav-icon">{item.icon}</span>}
      <span className="tk-label">{item.label}</span>
    </Link>
  );
}

function GroupRow({
  item,
  expanded,
  onToggle,
}: {
  item: GroupItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const expandable = item.children !== undefined;
  const shown = item.open ?? (expandable && expanded ? item.children : undefined);
  const link = (
    <Link
      href={item.href}
      className="tk-group-item"
      title={item.label}
      onClick={item.onSelect}
      aria-current={item.current ? "page" : item.open ? "true" : undefined}
    >
      {item.avatar ?? <Avatar name={item.label} />}
      <span className="tk-label">{item.label}</span>
      {!shown && item.status && <Dot status={item.status} />}
    </Link>
  );
  const sectionsId = `tk-group-${item.id}`;
  const row = expandable ? (
    <div className="tk-group-row">
      {link}
      <button
        type="button"
        className="tk-icon-button tk-chevron"
        aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
        aria-expanded={expanded}
        aria-controls={sectionsId}
        onClick={onToggle}
      >
        <ChevronIcon />
      </button>
    </div>
  ) : (
    link
  );
  if (!shown) return row;
  return (
    <div className="tk-group-open" id={sectionsId}>
      {row}
      {shown}
    </div>
  );
}

/** The frame every Kit app opens in. */
export function AppShell({
  app,
  nav,
  groups = [],
  bottom = [],
  settingsHref,
  onSearch,
  title,
  topAside,
  collapsed: collapsedProp,
  onCollapsedChange,
  children,
}: {
  app: { name: string; href?: string; mark?: ReactNode };
  nav: NavItem[];
  groups?: Group[];
  /** Pages that sit at the bottom of the sidebar, above Settings (for example Archive). */
  bottom?: NavItem[];
  settingsHref?: string;
  onSearch?: () => void;
  /** Where you are, shown in the top bar before the app name. */
  title?: ReactNode;
  /** Controls on the right of the top bar, for example the chat panel toggle. */
  topAside?: ReactNode;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useCollapsed(collapsedProp, onCollapsedChange);
  const openItems = useOpenItems();
  return (
    <div className="tk-root tk-shell" data-collapsed={collapsed ? "true" : "false"}>
      <aside className="tk-side" aria-label={`${app.name} navigation`}>
        <div className="tk-side-scroll">
          <Link href={app.href ?? "/"} className="tk-mark" title={app.name}>
            {app.mark ?? (
              <span className="tk-mark-icon" aria-hidden>
                {(app.name[0] ?? "?").toUpperCase()}
              </span>
            )}
            <span className="tk-label">{app.name}</span>
          </Link>
          <nav className="tk-nav" aria-label="Pages">
            {nav.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
          {groups.map((group) => (
            <div key={group.label} className="tk-group">
              {group.href ? (
                <Link href={group.href} className="tk-group-label">
                  {group.label}
                </Link>
              ) : (
                <span className="tk-group-label">{group.label}</span>
              )}
              {group.items.map((item) => (
                <GroupRow
                  key={item.id}
                  item={item}
                  expanded={openItems.isOpen(
                    `${group.label}/${item.id}`,
                    item.defaultOpen ?? false,
                  )}
                  onToggle={() =>
                    openItems.toggle(`${group.label}/${item.id}`, item.defaultOpen ?? false)
                  }
                />
              ))}
              {!group.items.length && group.empty && (
                <div className="tk-side-empty">{group.empty}</div>
              )}
            </div>
          ))}
        </div>
        {bottom.length > 0 && (
          <nav className="tk-nav tk-nav-bottom" aria-label="More pages">
            {bottom.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        )}
        <div className="tk-side-foot">
          {settingsHref ? (
            <Link href={settingsHref} className="tk-settings">
              Settings
            </Link>
          ) : (
            <span className="tk-settings" />
          )}
          {onSearch && (
            <button type="button" className="tk-icon-button" aria-label="Search" onClick={onSearch}>
              <SearchIcon />
            </button>
          )}
          <button
            type="button"
            className="tk-icon-button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed(!collapsed)}
          >
            <CollapseIcon />
          </button>
        </div>
      </aside>
      <div className="tk-main">
        <header className="tk-top">
          {title && <span className="tk-top-title">{title}</span>}
          <span className="tk-top-app">{app.name}</span>
          {topAside && <span className="tk-top-aside">{topAside}</span>}
        </header>
        <main className="tk-content">{children}</main>
      </div>
    </div>
  );
}
