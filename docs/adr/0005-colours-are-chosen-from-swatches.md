# 5. A colour is chosen from swatches, never from a list of names

## Context

Projects, labels and avatars have a colour. A menu of colour names is the obvious control.

## Decision

A colour is always chosen from round swatches, with the chosen one ticked, followed by a custom colour input. `ColourSwatches` in `src/suite/project-icon.tsx` is the one way to choose any colour, for a project's icon or a label. `ProjectIconPicker` in the same file uses it and draws its grid of icons in the chosen colour. The colours and icons are in `src/suite/project-appearance.ts`. `src/guard.ts` has the rule `colour-swatches`, which fails an app that offers colour names as menu, select or toggle items.

## Consequences

The names in `PROJECT_COLOURS` are labels for the swatches, not a list to show as text choices. A new place that needs a colour uses `ColourSwatches`.
