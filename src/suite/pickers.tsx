import { IconCheck } from "@tabler/icons-react";
import { type ComponentProps, type ReactNode, type RefObject, useEffect, useState } from "react";
import { Button } from "../ui/button.js";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command.js";
import { Kbd } from "../ui/kbd.js";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../ui/popover.js";

export type PickerChoice = { id: string; name: string; icon?: ReactNode; group?: string };

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

export function PropertyPicker({
  label,
  placeholder,
  hint,
  choices,
  chosen,
  onPick,
  many,
  onCreate,
  disabled,
  armed = true,
  anchor,
  side = "bottom",
  align = "start",
  children,
}: {
  label: string;
  placeholder: string;
  hint?: string;
  choices: PickerChoice[];
  chosen: string[];
  onPick: (id: string) => void;
  many?: boolean;
  onCreate?: (name: string) => void;
  disabled?: boolean;
  anchor?: RefObject<HTMLElement | null>;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  armed?: boolean | undefined;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => {
    if (!hint || disabled || !armed) return;
    const on = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
      if (e.key.toLowerCase() !== hint.toLowerCase()) return;
      e.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [hint, disabled, armed]);
  const pick = (id: string) => {
    onPick(id);
    if (!many) setOpen(false);
  };
  const ordered = many
    ? [
        ...choices.filter((c) => chosen.includes(c.id)),
        ...choices.filter((c) => !chosen.includes(c.id)),
      ]
    : choices;
  const groupOf = (c: PickerChoice) =>
    many ? (chosen.includes(c.id) ? "chosen" : "") : (c.group ?? "");
  const groups = [...new Set(ordered.map(groupOf))];
  const numbered = !many && ordered.length <= 10;
  const wanted = search.trim();
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      {anchor && <PopoverAnchor virtualRef={anchor as RefObject<HTMLElement>} />}
      <PopoverTrigger asChild disabled={disabled}>
        {children}
      </PopoverTrigger>
      <PopoverContent side={side} align={align} className="w-72 p-0">
        <Command
          onKeyDown={(e) => {
            if (!numbered || search !== "" || !/^[0-9]$/.test(e.key)) return;
            const target = ordered.find(
              (_, i) => String(i + (zeroFirst(ordered) ? 0 : 1)) === e.key,
            );
            if (!target) return;
            e.preventDefault();
            pick(target.id);
          }}
        >
          <div className="flex items-center gap-2 border-b pr-3 [&>div]:flex-1 [&>div]:border-b-0">
            <CommandInput
              leading={null}
              aria-label={label}
              placeholder={placeholder}
              value={search}
              onValueChange={setSearch}
              onKeyDown={(e) => {
                if (e.key !== "Enter" || !onCreate || !wanted) return;
                if (choices.some((c) => c.name.toLowerCase() === wanted.toLowerCase())) return;
                e.preventDefault();
                onCreate(wanted);
                setSearch("");
              }}
            />
            {hint && <Kbd>{hint}</Kbd>}
          </div>
          <CommandList>
            <CommandEmpty>
              {onCreate && wanted ? `Press Enter to add "${wanted}"` : "Nothing matches."}
            </CommandEmpty>
            {groups.map((group, g) => (
              <div key={group}>
                {g > 0 && <CommandSeparator />}
                <CommandGroup {...(group && !many ? { heading: group } : {})}>
                  {ordered
                    .filter((c) => groupOf(c) === group)
                    .map((c) => {
                      const number = ordered.indexOf(c) + (zeroFirst(ordered) ? 0 : 1);
                      return (
                        <CommandItem
                          key={c.id || "none"}
                          value={c.name}
                          onSelect={() => pick(c.id)}
                          className="group gap-3 px-3 py-2"
                        >
                          {many && (
                            <span
                              aria-hidden
                              className={`flex size-4 shrink-0 items-center justify-center rounded-[4px] border ${
                                chosen.includes(c.id)
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-transparent group-data-[selected=true]:border-input"
                              }`}
                            >
                              {chosen.includes(c.id) && <IconCheck size={12} stroke={3} />}
                            </span>
                          )}
                          {c.icon}
                          <span className="min-w-0 flex-1 truncate">{c.name}</span>
                          {!many && chosen.includes(c.id) && <IconCheck size={16} aria-hidden />}
                          {numbered && (
                            <span
                              aria-hidden
                              className="w-3 text-right text-xs text-muted-foreground"
                            >
                              {number}
                            </span>
                          )}
                        </CommandItem>
                      );
                    })}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const zeroFirst = (choices: PickerChoice[]) => choices[0]?.id === "" || choices[0]?.id === "none";

export function RailRow({
  icon,
  children,
  muted,
  ...rest
}: {
  icon?: ReactNode;
  children: ReactNode;
  muted?: boolean;
} & ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      className={`h-8 w-full min-w-0 justify-start gap-2 overflow-hidden px-2 font-normal ${muted ? "text-muted-foreground" : ""}`}
      {...rest}
    >
      {icon}
      <span className="min-w-0 truncate">{children}</span>
    </Button>
  );
}
