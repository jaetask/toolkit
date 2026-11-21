// The project "Icon & colour" picker from the earlier Tasks app, on the ported ui parts: ten round
// colour swatches (the chosen one ticked), a custom colour, icon search, and a six-column grid of
// Tabler icons drawn in the chosen colour. A colour is always chosen from a swatch, never a name.
import { DEFAULT_PROJECT_COLOUR, PROJECT_COLOURS, PROJECT_ICONS } from "./project-appearance.js";
import {
  IconFolder,
  IconRobot,
  IconCode,
  IconChecklist,
  IconLayoutKanban,
  IconRocket,
  IconBolt,
  IconFlame,
  IconStar,
  IconHeart,
  IconBulb,
  IconTarget,
  IconFlag,
  IconChartBar,
  IconWallet,
  IconCurrencyDollar,
  IconUser,
  IconTable,
  IconBrandX,
  IconWorld,
  IconCloud,
  IconDatabase,
  IconTerminal2,
  IconTool,
  IconBug,
  IconPalette,
  IconBook,
  IconCoffee,
  IconCheck,
} from "@tabler/icons-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover.js";
import { type ReactNode, useState } from "react";

import { Button } from "../ui/button.js";
import { Input } from "../ui/input.js";
import { Label } from "../ui/label.js";
const icons = {
  folder: IconFolder,
  robot: IconRobot,
  code: IconCode,
  checklist: IconChecklist,
  layout: IconLayoutKanban,
  rocket: IconRocket,
  bolt: IconBolt,
  flame: IconFlame,
  star: IconStar,
  heart: IconHeart,
  bulb: IconBulb,
  target: IconTarget,
  flag: IconFlag,
  chart: IconChartBar,
  wallet: IconWallet,
  dollar: IconCurrencyDollar,
  person: IconUser,
  table: IconTable,
  "brand-x": IconBrandX,
  globe: IconWorld,
  cloud: IconCloud,
  database: IconDatabase,
  terminal: IconTerminal2,
  tool: IconTool,
  bug: IconBug,
  palette: IconPalette,
  book: IconBook,
  coffee: IconCoffee,
};
export function ProjectIcon({
  projectIcon,
  iconColour,
  size = 18,
}: {
  projectIcon?: string;
  iconColour?: string;
  size?: number;
}) {
  const Icon = icons[projectIcon as keyof typeof icons] ?? IconFolder;
  return (
    <Icon
      aria-hidden="true"
      size={size}
      className="shrink-0"
      style={{ color: iconColour || DEFAULT_PROJECT_COLOUR }}
    />
  );
}
export function ProjectIconPicker({
  icon,
  colour,
  onIcon,
  onColour,
  title = "Project icon",
  children,
}: {
  icon: string;
  colour: string;
  onIcon: (v: string) => void;
  onColour: (v: string) => void;
  /** The heading inside the picker. */
  title?: string;
  /** What opens the picker, in place of the "Icon & colour" button: an avatar, say. */
  children?: ReactNode;
}) {
  const [search, setSearch] = useState("");
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children ?? (
          <Button
            type="button"
            variant="outline"
            aria-label="Choose project icon and colour"
            className="w-fit gap-2"
          >
            <ProjectIcon projectIcon={icon} iconColour={colour} size={24} />
            Icon & colour
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-4">
        <p className="text-sm font-medium">{title}</p>
        <ColourSwatches value={colour} onChange={onColour} label="Icon colour" />
        <Input
          aria-label="Search project icons"
          placeholder="Search icons…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* biome-ignore lint/a11y/useSemanticElements: a row of toggle buttons, as in the earlier app */}
        <div className="grid grid-cols-6 gap-1" role="group" aria-label="Project icons">
          {PROJECT_ICONS.filter((id) => id.includes(search.trim().toLowerCase())).map((id) => (
            <Button
              key={id}
              type="button"
              size="icon"
              variant={icon === id ? "secondary" : "ghost"}
              aria-label={`${id} icon`}
              title={id}
              aria-pressed={icon === id}
              onClick={() => onIcon(id)}
            >
              <ProjectIcon projectIcon={id} iconColour={colour} size={22} />
            </Button>
          ))}
        </div>
        {!PROJECT_ICONS.some((id) => id.includes(search.trim().toLowerCase())) && (
          <p className="text-sm text-muted-foreground">No matching icons.</p>
        )}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Round colour swatches, the chosen one ticked, then a custom colour input. The way to choose any
 * colour (a project's icon, a label): never a list of colour names.
 */
export function ColourSwatches({
  value,
  onChange,
  colours = PROJECT_COLOURS,
  custom = true,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  colours?: readonly { name: string; value: string }[];
  custom?: boolean;
  label: string;
}) {
  const current = value.toLowerCase();
  return (
    <>
      {/* biome-ignore lint/a11y/useSemanticElements: a row of toggle buttons, as in the earlier app */}
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {colours.map((c) => (
          <Button
            key={c.value}
            type="button"
            size="icon"
            variant="ghost"
            className="size-6 rounded-full p-0"
            style={{ backgroundColor: c.value }}
            aria-label={`${c.name} ${label.toLowerCase()}`}
            aria-pressed={current === c.value}
            onClick={() => onChange(c.value)}
          >
            {current === c.value && <IconCheck size={16} className="text-white" />}
          </Button>
        ))}
      </div>
      {custom && (
        <Label className="flex items-center justify-between text-xs text-muted-foreground">
          Custom colour
          <Input
            aria-label={`Custom ${label.toLowerCase()}`}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-12 cursor-pointer p-1"
          />
        </Label>
      )}
    </>
  );
}
