# 10. ViewToggle marks the chosen view with a class, not data-state

## Context

Each view button in `ViewToggle` is a ToggleGroupItem wrapped in a Tooltip trigger with `asChild`. Both Radix parts set `data-state` on the same element. The ported toggle styles the pressed item through `data-state=on`.

## Decision

The tooltip takes over `data-state` on the button, so the pressed style never matches. `ViewToggle` in `src/suite/views.tsx` compares each item's id with the current value and adds the chosen look as classes (`bg-primary text-primary-foreground` and their hover forms).

## Consequences

Removing the class in favour of the toggle's own `data-state` style leaves the chosen view unmarked while the tooltip wraps the button. The same holds for any ported part given a tooltip with `asChild`.
