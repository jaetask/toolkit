// The app shell: a light grey sidebar (app mark, nav with icons, small-caps groups of projects or
// entities with status dots, Settings at the bottom), a top bar, and the page. Every Kit app opens
// in this frame; the app passes data and the shell draws it.
import { type DragEvent, type ReactNode, useEffect, useState } from "react";
import { Link } from "./link.js";
import { ResourceIcon } from "../icons/ResourceIcon.js";
import type { ResourceIconValue } from "../icons/types.js";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.js";
import { Button } from "../ui/button.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible.js";
import { Dot, type Progress } from "./page.js";
import { ProjectIcon } from "./project-icon.js";

export type NavItem = {
  href: string;
  label: string;
  /** A 16px line icon (for example from @tabler/icons-react). */
  icon?: ReactNode;
  current?: boolean;
  /** A number shown at the right of the row, such as items waiting. */
  count?: number;
};

export type GroupItem = {
  id: string;
  href: string;
  label: string;
  /** The item's icon, as the ResourceIconPicker stores it. Else `avatar`, else the first letter. */
  icon?: ResourceIconValue | null;
  /** A project icon by name and its colour, as the ProjectIconPicker stores them. */
  projectIcon?: string;
  iconColour?: string;
  /** An image URL for a round avatar. */
  image?: string;
  /** Anything else to show before the label. */
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
  /**
   * Lets the person reorder the items by dragging a row, or with Alt+Up and Alt+Down on a focused
   * row. Gets the item ids in their new order; save it, then pass the items back in that order.
   */
  onReorder?: (ids: string[]) => void;
};

const GROUP_DRAG_TYPE = "application/x-tk-group-item";

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

/** The mark before a group item's label: its icon, an image, or the first letter. */
function ItemMark({ item }: { item: GroupItem }) {
  if (item.avatar) return <>{item.avatar}</>;
  if (item.projectIcon)
    return (
      <span className="tk-item-icon" aria-hidden>
        <ProjectIcon projectIcon={item.projectIcon} iconColour={item.iconColour} size={18} />
      </span>
    );
  if (item.icon)
    return (
      <span className="tk-item-icon" aria-hidden>
        <ResourceIcon value={item.icon} size={18} />
      </span>
    );
  return (
    <Avatar className="tk-item-avatar" aria-hidden>
      {item.image && <AvatarImage src={item.image} alt="" />}
      <AvatarFallback>{(item.label.trim()[0] ?? "?").toUpperCase()}</AvatarFallback>
    </Avatar>
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
      {item.count !== undefined && item.count > 0 && <span className="tk-count">{item.count}</span>}
    </Link>
  );
}

type Move = {
  onMove: (id: string, before: string | null) => void;
  onStep: (id: string, by: -1 | 1) => void;
};

function GroupRow({
  item,
  expanded,
  onToggle,
  move,
}: {
  item: GroupItem;
  expanded: boolean;
  onToggle: () => void;
  move?: Move;
}) {
  const [over, setOver] = useState(false);
  const expandable = item.children !== undefined && !item.open;
  const shown = item.open ?? (expandable && expanded ? item.children : undefined);
  const link = (
    <Link
      href={item.href}
      className="tk-group-item"
      title={item.label}
      onClick={item.onSelect}
      aria-current={item.current ? "page" : item.open ? "true" : undefined}
      aria-keyshortcuts={move ? "Alt+ArrowUp Alt+ArrowDown" : undefined}
      onKeyDown={
        move
          ? (e) => {
              if (!e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
              e.preventDefault();
              move.onStep(item.id, e.key === "ArrowUp" ? -1 : 1);
            }
          : undefined
      }
    >
      <ItemMark item={item} />
      <span className="tk-label">{item.label}</span>
      {!shown && item.status && <Dot status={item.status} />}
    </Link>
  );
  const sectionsId = `tk-group-${item.id}`;
  const row = expandable ? (
    <div className="tk-group-row">
      {link}
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="tk-icon-button tk-chevron"
          aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
        >
          <ChevronIcon />
        </Button>
      </CollapsibleTrigger>
    </div>
  ) : (
    link
  );
  const drag = move
    ? {
        draggable: true,
        "data-over": over ? "true" : undefined,
        onDragStart: (e: DragEvent<HTMLDivElement>) => {
          e.dataTransfer.setData(GROUP_DRAG_TYPE, item.id);
          e.dataTransfer.effectAllowed = "move";
        },
        onDragOver: (e: DragEvent<HTMLDivElement>) => {
          if (!e.dataTransfer.types.includes(GROUP_DRAG_TYPE)) return;
          e.preventDefault();
          if (!over) setOver(true);
        },
        onDragLeave: () => setOver(false),
        onDrop: (e: DragEvent<HTMLDivElement>) => {
          setOver(false);
          const id = e.dataTransfer.getData(GROUP_DRAG_TYPE);
          if (!id || id === item.id) return;
          e.preventDefault();
          move.onMove(id, item.id);
        },
      }
    : {};
  if (expandable && !item.open)
    return (
      <Collapsible asChild open={expanded} onOpenChange={onToggle}>
        <div className={expanded ? "tk-group-open" : "tk-group-slot"} {...drag}>
          {row}
          <CollapsibleContent id={sectionsId}>{item.children}</CollapsibleContent>
        </div>
      </Collapsible>
    );
  return (
    <div
      className={shown ? "tk-group-open" : "tk-group-slot"}
      id={shown ? sectionsId : undefined}
      {...drag}
    >
      {row}
      {shown}
    </div>
  );
}

function reorder(ids: string[], id: string, before: string | null): string[] {
  const rest = ids.filter((x) => x !== id);
  const at = before === null ? rest.length : rest.indexOf(before);
  rest.splice(at < 0 ? rest.length : at, 0, id);
  return rest;
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
  side,
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
  /** The app's own navigation, drawn under the pages (for example its projects). It is told whether the sidebar is collapsed. */
  side?: (collapsed: boolean) => ReactNode;
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
          {side?.(collapsed)}
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
                  move={
                    group.onReorder
                      ? {
                          onMove: (id, before) => {
                            const ids = group.items.map((i) => i.id);
                            group.onReorder?.(reorder(ids, id, before));
                          },
                          onStep: (id, by) => {
                            const ids = group.items.map((i) => i.id);
                            const at = ids.indexOf(id) + by;
                            if (at < 0 || at >= ids.length) return;
                            const before = by < 0 ? (ids[at] ?? null) : (ids[at + 1] ?? null);
                            group.onReorder?.(reorder(ids, id, before));
                          },
                        }
                      : undefined
                  }
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
            <Button
              variant="ghost"
              size="icon-sm"
              className="tk-icon-button"
              aria-label="Search"
              onClick={onSearch}
            >
              <SearchIcon />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className="tk-icon-button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed(!collapsed)}
          >
            <CollapseIcon />
          </Button>
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
