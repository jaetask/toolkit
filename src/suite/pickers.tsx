// Property pickers: a quiet row that opens a searchable list in a popover, as on a ticket's
// rail or on a card. A letter key opens one; a number key picks a row.
import { IconCheck } from "@tabler/icons-react";
import { type ComponentProps, type ReactNode, useEffect, useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover.js";

/** One row of a PropertyPicker. An empty id or "none" stands for no value. */
export type PickerChoice = { id: string; name: string; icon?: ReactNode; group?: string };

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * A row that opens a searchable list. `chosen` holds one id, or several when `many`. The key in
 * `hint` opens it from anywhere on the ticket; the number beside a row picks it.
 */
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
  children,
}: {
  label: string;
  placeholder: string;
  hint?: string;
  choices: PickerChoice[];
  chosen: string[];
  onPick: (id: string) => void;
  many?: boolean;
  /** Makes a new choice from the words typed, when none matches. */
  onCreate?: (name: string) => void;
  disabled?: boolean;
  /** False while the key in `hint` should not open it. True if left out. */
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
  // Chosen ones first when several can be chosen; otherwise the order given.
  const ordered = many
    ? [
        ...choices.filter((c) => chosen.includes(c.id)),
        ...choices.filter((c) => !chosen.includes(c.id)),
      ]
    : choices;
  // With several to choose, the chosen ones sit above a line; otherwise choices keep their groups.
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
      <PopoverTrigger asChild disabled={disabled}>
        {children}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
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
          <div className="flex items-center gap-2 pr-2">
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
                            // A tick box: filled when chosen, an outline on the row in hand.
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

// A list that starts with a "none" choice numbers from 0, as "No priority" is 0.
const zeroFirst = (choices: PickerChoice[]) => choices[0]?.id === "" || choices[0]?.id === "none";

/** The quiet button a property row is: an icon and a value, grey on hover. */
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
