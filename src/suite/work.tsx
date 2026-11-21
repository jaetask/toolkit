// Working pages: a small title with the page's actions beside it, sections with a quiet heading,
// names edited where they are shown, a "..." menu on a row, and a dialog for a short form.
import { IconChevronRight, IconDots, IconHelpCircle, IconPlus } from "@tabler/icons-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.js";
import { Input } from "../ui/input.js";
import { Label } from "../ui/label.js";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover.js";
import { DEFAULT_PROJECT_COLOUR, PROJECT_ICONS } from "./project-appearance.js";
import { ProjectIcon } from "./project-icon.js";

/**
 * A working page: one small title, what the page is for behind a "?", the page's actions on the
 * right, then its content straight on the page. `wide` uses the whole width, for a board.
 */
export function WorkPage({
  title,
  icon,
  help,
  action,
  wide,
  children,
}: {
  title: string;
  /** A mark before the title, such as a project's icon. */
  icon?: ReactNode;
  /** What the page is for, shown when "?" is pressed. */
  help?: ReactNode;
  action?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="tk-page tk-work" data-wide={wide ? "true" : undefined}>
      <div className="tk-work-head">
        <div className="tk-work-title-row">
          {icon}
          <h1 className="tk-work-title">{title}</h1>
          {help && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`About ${title}`}
                  className="text-muted-foreground [&_svg]:size-4"
                >
                  <IconHelpCircle aria-hidden />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 text-sm text-muted-foreground">
                {help}
              </PopoverContent>
            </Popover>
          )}
        </div>
        {action && <div className="tk-work-actions">{action}</div>}
      </div>
      {children}
    </div>
  );
}

/**
 * A section of a page: a small grey heading that folds, a count, and at most one "+" on the
 * right where things can be added.
 */
export function PageSection({
  id,
  title,
  count,
  onAdd,
  addLabel,
  aside,
  defaultOpen = true,
  children,
}: {
  id?: string;
  title: string;
  count?: ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  /** Anything else for the right of the heading. */
  aside?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <Collapsible asChild defaultOpen={defaultOpen}>
      <section id={id} aria-label={title} className="tk-section">
        <div className="tk-section-head">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="tk-section-title group/section">
              <IconChevronRight
                size={14}
                aria-hidden
                className="transition-transform group-data-[state=open]/section:rotate-90"
              />
              {title}
              {count !== undefined && count !== "" && (
                <span className="tk-section-count">{count}</span>
              )}
            </Button>
          </CollapsibleTrigger>
          <span className="flex items-center gap-1">
            {aside}
            {onAdd && (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={addLabel ?? `Add to ${title}`}
                className="text-muted-foreground"
                onClick={onAdd}
              >
                <IconPlus aria-hidden />
              </Button>
            )}
          </span>
        </div>
        <CollapsibleContent className="grid gap-1">{children}</CollapsibleContent>
      </section>
    </Collapsible>
  );
}

/** What a list says when it holds nothing: one quiet line. */
export function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="tk-empty-line">{children}</p>;
}

/**
 * A name edited where it is shown. A click turns it into a box; Enter or leaving the box saves,
 * Escape puts back what was there.
 */
export function InlineText({
  value,
  label,
  onSave,
  disabled,
  editing,
  onEditingChange,
  maxLength = 60,
  className,
}: {
  value: string;
  /** What the box is called, such as "Rename Coder". */
  label: string;
  onSave: (value: string) => void;
  disabled?: boolean;
  /** Set to open or close the box from outside, such as from a row's Rename. */
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  maxLength?: number;
  className?: string;
}) {
  const [own, setOwn] = useState(false);
  const on = editing ?? own;
  const set = (next: boolean) => {
    setOwn(next);
    onEditingChange?.(next);
  };
  if (on && !disabled)
    return (
      <Input
        autoFocus
        aria-label={label}
        className={`h-7 min-w-0 flex-1 ${className ?? ""}`}
        maxLength={maxLength}
        defaultValue={value}
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            e.stopPropagation();
            e.currentTarget.value = value;
            e.currentTarget.blur();
          }
        }}
        onBlur={(e) => {
          const wanted = e.currentTarget.value.trim();
          set(false);
          if (wanted && wanted !== value) onSave(wanted);
        }}
      />
    );
  return (
    <Button
      variant="ghost"
      disabled={disabled ?? false}
      title={disabled ? undefined : "Click to rename"}
      className={`h-auto min-w-0 cursor-text justify-start truncate p-0 text-left hover:bg-transparent disabled:opacity-100 ${className ?? ""}`}
      onClick={() => set(true)}
    >
      {value}
    </Button>
  );
}

/** One line of a RowMenu: something to do, a line between groups, or a menu inside the menu. */
export type MenuEntry =
  | { label: string; onSelect: () => void; disabled?: boolean; hint?: string }
  | { label: string; items: MenuEntry[]; disabled?: boolean }
  | { label: string; content: ReactNode }
  | "line";

function Entries({ items }: { items: MenuEntry[] }) {
  return (
    <>
      {items.map((item, i) => {
        // biome-ignore lint/suspicious/noArrayIndexKey: a menu's lines never reorder
        if (item === "line") return <DropdownMenuSeparator key={i} />;
        if ("items" in item || "content" in item)
          return (
            <DropdownMenuSub key={item.label}>
              <DropdownMenuSubTrigger disabled={("disabled" in item && item.disabled) ?? false}>
                {item.label}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {"items" in item ? (
                  <Entries items={item.items} />
                ) : (
                  <div className="p-2">{item.content}</div>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          );
        return (
          <DropdownMenuItem
            key={item.label}
            disabled={item.disabled ?? false}
            onSelect={item.onSelect}
          >
            {item.label}
            {item.hint && (
              <span className="ml-auto pl-4 text-xs text-muted-foreground">{item.hint}</span>
            )}
          </DropdownMenuItem>
        );
      })}
    </>
  );
}

/**
 * The "..." at the end of a row or the top of a page: everything that can be done to the thing,
 * in one quiet menu. `quiet` shows the button only while its row is pointed at or focused.
 */
export function RowMenu({
  label,
  items,
  quiet,
  align = "end",
}: {
  /** What the menu is for, such as "Label bug". */
  label: string;
  items: MenuEntry[];
  quiet?: boolean;
  align?: "start" | "end";
}) {
  // What an item does runs once the menu has closed and given up the focus, so a box or dialog
  // it opens keeps the focus it takes.
  const after = useRef<(() => void) | null>(null);
  const later = (entries: MenuEntry[]): MenuEntry[] =>
    entries.map((e) =>
      e === "line" || "content" in e
        ? e
        : "items" in e
          ? { ...e, items: later(e.items) }
          : {
              ...e,
              onSelect: () => {
                const run = e.onSelect;
                after.current = run;
                // A menu opened again before it finished closing never says it closed: the
                // item still runs, a moment later.
                setTimeout(() => {
                  if (after.current !== run) return;
                  after.current = null;
                  run();
                }, 400);
              },
            },
    );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={label}
          className={`text-muted-foreground ${quiet ? "opacity-0 focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100" : ""}`}
        >
          <IconDots aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        onCloseAutoFocus={(e) => {
          const run = after.current;
          after.current = null;
          if (!run) return;
          e.preventDefault();
          run();
        }}
      >
        <Entries items={later(items)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * A short form in the centre of the page: a title, its fields, Cancel and one button that saves.
 * Enter in a field saves; Cmd+Enter saves from anywhere in it. `onSave` answers true to close.
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  line,
  saveLabel = "Save",
  onSave,
  extra,
  wide,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  line?: ReactNode;
  saveLabel?: string;
  onSave: () => boolean | Promise<boolean>;
  /** Something for the left of the buttons. */
  extra?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (await onSave()) onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent className={wide ? "w-[min(44rem,95vw)] max-w-none" : "max-w-md"}>
          <form
            className="grid min-w-0 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void save();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void save();
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {line ? (
                <DialogDescription>{line}</DialogDescription>
              ) : (
                <DialogDescription className="sr-only">{title}</DialogDescription>
              )}
            </DialogHeader>
            {children}
            <DialogFooter className="items-center">
              {extra && <span className="mr-auto flex items-center gap-2">{extra}</span>}
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {saveLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

/** One field of a FormDialog: its name above it, and a line of help under it when it needs one. */
export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-1.5">
      {htmlFor ? (
        <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
      ) : (
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      )}
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

/**
 * The round mark of a person or an agent: its icon in its colour, an emoji, or the first letter
 * of its name on grey.
 */
export function IconAvatar({
  name,
  icon,
  colour,
  size = 24,
}: {
  name: string;
  /** An icon name the ProjectIconPicker offers, an emoji, or nothing. */
  icon?: string;
  colour?: string;
  size?: number;
}) {
  const named = !!icon && (PROJECT_ICONS as readonly string[]).includes(icon);
  return (
    <span
      aria-hidden
      className="tk-icon-avatar"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.46) }}
    >
      {named ? (
        <ProjectIcon
          projectIcon={icon}
          iconColour={colour || DEFAULT_PROJECT_COLOUR}
          size={Math.round(size * 0.62)}
        />
      ) : (
        icon || (name.trim()[0] ?? "?").toUpperCase()
      )}
    </span>
  );
}

/** How long ago a time was, in a few letters: "now", "5m ago", "3h ago", "2d ago", "6w ago". */
export function ago(at: string | number | Date, now: number = Date.now()): string {
  const minutes = Math.max(0, Math.floor((now - new Date(at).getTime()) / 60_000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** A time shown as how long ago it was; the full date shows when it is pointed at. */
export function TimeAgo({ at, prefix }: { at: string; prefix?: string }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => tick((n) => n + 1), 60_000);
    return () => clearInterval(timer);
  }, []);
  return (
    <time dateTime={at} title={new Date(at).toLocaleString()}>
      {prefix ? `${prefix} ${ago(at)}` : ago(at)}
    </time>
  );
}
