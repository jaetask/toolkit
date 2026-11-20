// Choosing how a board looks: the buttons that pick a view, and the pills that pick what a card shows.
import type { ComponentType } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group.js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip.js";

/** One way to group a board: its id, the name its button is known by, and the button's icon. */
export type ViewChoice<Id extends string = string> = {
  id: Id;
  label: string;
  Icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  /** The heading shown above the board in this view, where an app shows one. */
  heading?: string;
};

/** The buttons that choose how a board groups its tickets. */
export function ViewToggle<Id extends string>({
  views,
  value,
  onChange,
  label = "Board view",
}: {
  label?: string;
  views: readonly ViewChoice<Id>[];
  value: Id;
  onChange: (view: Id) => void;
}) {
  return (
    <TooltipProvider>
      <ToggleGroup
        type="single"
        aria-label={label}
        className="gap-1 rounded-lg border p-1"
        value={value}
        onValueChange={(v) => {
          if (v) onChange(v as Id);
        }}
      >
        {views.map(({ id, label, Icon }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={id}
                aria-label={`${label} view`}
                // The tooltip takes over data-state, so the chosen view is marked by class.
                className={`size-8 p-0 ${value === id ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : ""}`}
              >
                <Icon size={18} aria-hidden />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </TooltipProvider>
  );
}

/**
 * Pills that are each on or off, such as the properties a card shows. `value` holds the ids
 * that are on.
 */
export function PropertyPills({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly (readonly [id: string, name: string])[];
  value: readonly string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <ToggleGroup
      type="multiple"
      aria-label={label}
      className="flex-wrap justify-start gap-1.5"
      value={[...value]}
      onValueChange={onChange}
    >
      {options.map(([id, name]) => (
        <ToggleGroupItem
          key={id}
          value={id}
          className="h-7 rounded-full border px-3 text-xs font-normal text-muted-foreground data-[state=on]:border-transparent data-[state=on]:bg-muted data-[state=on]:text-foreground"
        >
          {name}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
