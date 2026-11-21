import { IconFilter, IconX } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { Button } from "../ui/button.js";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.js";

export type FilterChoice = {
  id: string;
  label: string;
  icon?: ReactNode;
  options: { id: string; name: string }[];
  many?: boolean;
};

export function FilterMenu({
  filters,
  values,
  onChange,
}: {
  filters: FilterChoice[];
  values: Record<string, string[]>;
  onChange: (id: string, chosen: string[]) => void;
}) {
  const used = filters.filter((f) => (values[f.id] ?? []).length > 0);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Filter"
            title="Filter"
            className="text-muted-foreground [&_svg]:size-4"
          >
            <IconFilter aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" aria-label="Filter by">
          {filters.map((f) => (
            <DropdownMenuSub key={f.id}>
              <DropdownMenuSubTrigger className="gap-2">
                {f.icon}
                {f.label}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-80 overflow-y-auto">
                {f.options.map((o) => {
                  const chosen = values[f.id] ?? [];
                  const on = chosen.includes(o.id);
                  return (
                    <DropdownMenuCheckboxItem
                      key={o.id}
                      checked={on}
                      onSelect={(e) => {
                        if (f.many) e.preventDefault();
                      }}
                      onCheckedChange={() =>
                        onChange(
                          f.id,
                          on
                            ? chosen.filter((id) => id !== o.id)
                            : f.many
                              ? [...chosen, o.id]
                              : [o.id],
                        )
                      }
                    >
                      {o.name}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {used.map((f) => {
        const names = (values[f.id] ?? []).map(
          (id) => f.options.find((o) => o.id === id)?.name ?? id,
        );
        return (
          <span key={f.id} className="tk-filter-chip" data-filter={f.id}>
            <span className="text-muted-foreground">{f.label}</span>
            <span className="truncate">{names.join(", ")}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-5 text-muted-foreground"
              aria-label={`Remove the ${f.label.toLowerCase()} filter`}
              onClick={() => onChange(f.id, [])}
            >
              <IconX aria-hidden />
            </Button>
          </span>
        );
      })}
    </>
  );
}
