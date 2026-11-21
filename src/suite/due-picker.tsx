import { IconCalendar, IconCalendarOff } from "@tabler/icons-react";
import { type ReactNode, useEffect, useState } from "react";
import { Calendar } from "../ui/calendar.js";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command.js";
import { Kbd } from "../ui/kbd.js";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover.js";
import { day, endOfWeek, parseDue } from "./due.js";

export function dueLabel(due: string, now: Date = new Date()): string {
  const date = new Date(`${due}T00:00:00`);
  const days = Math.round(
    (date.getTime() - new Date(`${day(now)}T00:00:00`).getTime()) / 86_400_000,
  );
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 1 && days < 7) return date.toLocaleDateString("en-US", { weekday: "short" });
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  });
}

export function dueState(due: string, now: Date = new Date()): "overdue" | "soon" | "later" {
  const today = day(now);
  if (due < today) return "overdue";
  return due <= day(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
    ? "soon"
    : "later";
}

const full = (due: string) =>
  new Date(`${due}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

export function DueDatePicker({
  value,
  onChange,
  disabled,
  armed = true,
  children,
}: {
  value: string | null;
  onChange: (due: string | null) => void;
  disabled?: boolean;
  armed?: boolean;
  children: ReactNode;
}) {
  const [shown, setShown] = useState(false);
  const [search, setSearch] = useState("");
  const [calendar, setCalendar] = useState(false);
  const can = !disabled;
  useEffect(() => {
    if (!can || !armed) return;
    const on = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
      if (
        typing ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        !e.shiftKey ||
        e.key.toLowerCase() !== "d"
      ) {
        return;
      }
      e.preventDefault();
      setShown(true);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [can, armed]);
  const set = (due: string | null) => {
    setShown(false);
    onChange(due);
  };
  const now = new Date();
  const typed = parseDue(search, now);
  const rows: [string, string][] = [
    ["Tomorrow", day(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))],
    ["End of this week", endOfWeek(now)],
    ["In one week", day(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7))],
  ];
  return (
    <Popover
      open={shown}
      onOpenChange={(next) => {
        setShown(next);
        if (!next) {
          setSearch("");
          setCalendar(false);
        }
      }}
    >
      <PopoverTrigger asChild disabled={!can}>
        {children}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        {calendar ? (
          <Calendar
            mode="single"
            {...(value ? { selected: new Date(`${value}T00:00:00`) } : {})}
            onSelect={(picked: Date | undefined) => picked && set(day(picked))}
          />
        ) : (
          <Command shouldFilter={false}>
            <div className="flex items-center gap-2 pr-2">
              <CommandInput
                aria-label="Due date"
                placeholder="Try: 24h, 7 days, Feb 9"
                value={search}
                onValueChange={setSearch}
              />
              <Kbd>⇧D</Kbd>
            </div>
            <CommandList>
              <CommandGroup>
                {typed && (
                  <CommandItem value="typed" onSelect={() => set(typed)}>
                    <IconCalendar size={16} aria-hidden />
                    <span className="flex-1">{dueLabel(typed, now)}</span>
                    <span className="text-xs text-muted-foreground">{full(typed)}</span>
                  </CommandItem>
                )}
                {value && (
                  <CommandItem value="remove" onSelect={() => set(null)}>
                    <IconCalendarOff size={16} aria-hidden />
                    <span className="flex-1">Remove due date</span>
                    <span className="text-xs text-muted-foreground">{full(value)}</span>
                  </CommandItem>
                )}
                <CommandItem value="custom" onSelect={() => setCalendar(true)}>
                  <IconCalendar size={16} aria-hidden />
                  <span className="flex-1">Custom...</span>
                </CommandItem>
                {rows.map(([name, due]) => (
                  <CommandItem key={name} value={name} onSelect={() => set(due)}>
                    <IconCalendar size={16} aria-hidden />
                    <span className="flex-1">{name}</span>
                    <span className="text-xs text-muted-foreground">{full(due)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}

const DUE_ICON = {
  overdue: "text-red-600",
  soon: "text-orange-500",
  later: "text-muted-foreground",
} as const;
export function DueIcon({ due, size = 16 }: { due: string | null; size?: number }) {
  return (
    <IconCalendar
      size={size}
      aria-hidden
      className={due ? DUE_ICON[dueState(due)] : "text-muted-foreground"}
    />
  );
}
