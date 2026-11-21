# 11. PropertyPicker: a fixed anchor, numbers that start at 0 for a none choice, and one full-width line under the search box

## Context

`PropertyPicker` in `src/suite/pickers.tsx` is a searchable list in a popover, opened from a row or a card. Its trigger can move while the list is open, a number key picks a row, and the key hint sits beside the search box.

## Decision

Three things are done on purpose. With the `anchor` prop, a `PopoverAnchor` with that ref is rendered, so the list opens from that fixed place wherever the trigger has moved to. Rows are numbered from 1, but a list whose first choice has the id `""` or `"none"` is numbered from 0, as "No priority" is 0. The border under the search box is drawn on the wrapper that holds both the input and the key hint, and the input's own bottom border is removed with a child selector, so the line runs the full width, under the key hint too.

## Consequences

Numbers are shown, and number keys work, only for a single-choice list of ten or fewer and only while the search box is empty. The child selector `[&>div]` depends on the ported CommandInput rendering one wrapping `div`; if that part changes, the line under the search box needs checking.
