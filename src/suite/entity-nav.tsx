import {
  IconArrowDown,
  IconArrowUp,
  IconChevronRight,
  IconGripVertical,
} from "@tabler/icons-react";
import { type DragEvent, type ReactNode, useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible.js";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "../ui/context-menu.js";
import { Link } from "./link.js";

export type EntityDrop = {
  accepts: (event: DragEvent) => boolean;
  onDrop: (event: DragEvent) => void;
};

export type EntityLink = {
  key: string;
  label: string;
  href: string;
  icon?: ReactNode;
  current?: boolean;
  drop?: EntityDrop;
  nested?: () => ReactNode;
  openNested?: boolean;
};

export type Entity = {
  id: string;
  name: string;
  href: string;
  mark: ReactNode;
  current?: boolean;
  links: EntityLink[];
  menu?: ReactNode;
};

export type EntityNavProps = {
  label: string;
  entities: Entity[];
  collapsed: boolean;
  selected: string | null;
  storageKey: string;
  kind?: string;
  onMove?: (id: string, index: number) => void | Promise<void>;
  empty?: ReactNode;
};

const SUB =
  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-sidebar-foreground";

export const ENTITY_SUB_LINK = SUB;

function readExpanded(storageKey: string): Record<string, boolean> {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (saved && typeof saved === "object")
      return Object.fromEntries(
        Object.entries(saved).filter(([, v]) => typeof v === "boolean"),
      ) as Record<string, boolean>;
  } catch {}
  return {};
}

function writeExpanded(storageKey: string, value: Record<string, boolean>) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {}
}

function Chevron({ open, label }: { open: boolean; label: string }) {
  return (
    <CollapsibleTrigger asChild>
      <Button variant="ghost" size="icon" aria-label={label} className="size-6 shrink-0 p-1">
        <IconChevronRight
          size={14}
          className={open ? "rotate-90 transition-transform" : "transition-transform"}
        />
      </Button>
    </CollapsibleTrigger>
  );
}

function dropProps(drop: EntityDrop | undefined) {
  if (!drop) return {};
  return {
    onDragOver: (e: DragEvent) => {
      if (!drop.accepts(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDrop: (e: DragEvent) => {
      if (!drop.accepts(e)) return;
      e.preventDefault();
      drop.onDrop(e);
    },
  };
}

export function EntityNav({
  label,
  entities,
  collapsed,
  selected,
  storageKey,
  kind = "entity",
  onMove,
  empty,
}: EntityNavProps) {
  const [moving, setMoving] = useState(false);
  const [dragged, setDragged] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => readExpanded(storageKey));
  const remember = useCallback(
    (key: string, open: boolean) => {
      setExpanded((previous) => {
        const next = { ...previous, [key]: open };
        writeExpanded(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const chosen = entities.find((e) => e.id === selected);
  const autoOpen = chosen
    ? [
        `${kind}:${chosen.id}`,
        ...chosen.links.filter((l) => l.openNested).map((l) => `${l.key}:${chosen.id}`),
      ]
    : [];
  const wanted = autoOpen.join("|");
  useEffect(() => {
    if (!wanted) return;
    setExpanded((previous) => {
      const missing = wanted.split("|").filter((key) => previous[key] === undefined);
      if (!missing.length) return previous;
      const next = { ...previous };
      for (const key of missing) next[key] = true;
      writeExpanded(storageKey, next);
      return next;
    });
  }, [wanted, storageKey]);

  async function move(id: string, target: number) {
    if (moving || !onMove) return;
    const from = entities.findIndex((e) => e.id === id);
    if (from < 0 || from === target || target < 0 || target >= entities.length) return;
    setMoving(true);
    try {
      await onMove(id, target);
    } finally {
      setMoving(false);
    }
  }

  if (!entities.length) return collapsed || !empty ? null : <>{empty}</>;
  return (
    <nav
      aria-label={label}
      className={
        collapsed ? "grid gap-1" : "grid max-h-[60vh] shrink-0 gap-1 overflow-y-auto px-3 pb-4"
      }
    >
      {!collapsed && <p className="px-3 text-xs font-medium text-muted-foreground">{label}</p>}
      {entities.map((entity, index) => {
        const open = expanded[`${kind}:${entity.id}`] ?? selected === entity.id;
        const row = (
          // biome-ignore lint/a11y/noStaticElementInteractions: a row can be dropped on another to reorder; the arrow buttons do the same by keyboard
          <div
            className="group flex items-center rounded-md hover:bg-sidebar-accent"
            onDragOver={(e) => {
              if (dragged) e.preventDefault();
            }}
            onDrop={(e) => {
              if (!dragged) return;
              e.preventDefault();
              void move(dragged, index);
              setDragged(null);
            }}
          >
            {!collapsed && onMove && (
              // biome-ignore lint/a11y/noStaticElementInteractions: the drag handle; the arrow buttons do the same by keyboard
              <span
                draggable={!moving}
                onDragStart={(e) => {
                  setDragged(entity.id);
                  e.dataTransfer.setData("text/plain", entity.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => setDragged(null)}
                title={`Drag to reorder ${entity.name}`}
                className="cursor-grab p-1 text-muted-foreground"
              >
                <IconGripVertical size={14} />
              </span>
            )}
            <Link
              href={entity.href}
              title={entity.name}
              aria-label={entity.name}
              onClick={() => remember(`${kind}:${entity.id}`, true)}
              aria-current={entity.current ? "page" : undefined}
              className="flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-sm aria-[current=page]:bg-sidebar-accent"
            >
              {entity.mark}
              {!collapsed && <span className="truncate">{entity.name}</span>}
            </Link>
            {!collapsed && <Chevron open={open} label={`Toggle ${entity.name}`} />}
            {!collapsed && onMove && (
              <div className="ml-auto flex shrink-0 opacity-0 focus-within:opacity-100 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Move ${entity.name} up`}
                  title="Move up"
                  disabled={index === 0 || moving}
                  onClick={() => void move(entity.id, index - 1)}
                  className="size-6 p-1 disabled:opacity-30"
                >
                  <IconArrowUp size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Move ${entity.name} down`}
                  title="Move down"
                  disabled={index === entities.length - 1 || moving}
                  onClick={() => void move(entity.id, index + 1)}
                  className="size-6 p-1 disabled:opacity-30"
                >
                  <IconArrowDown size={12} />
                </Button>
              </div>
            )}
          </div>
        );
        return (
          <Collapsible
            key={entity.id}
            open={open}
            onOpenChange={(o) => remember(`${kind}:${entity.id}`, o)}
            className="shrink-0"
          >
            {entity.menu ? (
              <ContextMenu>
                <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
                <ContextMenuContent>{entity.menu}</ContextMenuContent>
              </ContextMenu>
            ) : (
              row
            )}
            {!collapsed && (
              <CollapsibleContent className="ml-7 grid gap-1 pl-2">
                {entity.links.map((link) => {
                  const anchor = (
                    <Link
                      key={link.key}
                      href={link.href}
                      aria-current={link.current ? "page" : undefined}
                      className={link.nested ? SUB.replace(" hover:bg-sidebar-accent", "") : SUB}
                      {...dropProps(link.drop)}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  );
                  if (!link.nested) return anchor;
                  const key = `${link.key}:${entity.id}`;
                  const nestedOpen = expanded[key] ?? (selected === entity.id && !!link.openNested);
                  return (
                    <Collapsible
                      key={link.key}
                      open={nestedOpen}
                      onOpenChange={(o) => remember(key, o)}
                    >
                      <div className="flex items-center rounded-md hover:bg-sidebar-accent">
                        {anchor}
                        <Chevron
                          open={nestedOpen}
                          label={`Toggle ${entity.name} ${link.label.toLowerCase()}`}
                        />
                      </div>
                      <CollapsibleContent className="ml-3 grid gap-1 pl-2">
                        {nestedOpen ? link.nested() : null}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </CollapsibleContent>
            )}
          </Collapsible>
        );
      })}
    </nav>
  );
}
