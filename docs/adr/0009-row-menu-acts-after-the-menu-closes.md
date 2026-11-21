# 9. A RowMenu item acts after the menu has closed and given up the focus

## Context

A menu item often opens a rename box or a dialog. A Radix dropdown menu returns the focus to its trigger as it closes. If the item's action ran on select, the box or dialog would open, take the focus, and then lose it to the trigger.

## Decision

`RowMenu` in `src/suite/work.tsx` does not run an item's `onSelect` at once. It keeps the action and runs it from the menu content's `onCloseAutoFocus`, with `preventDefault` so the focus does not go back to the trigger. The box or dialog the action opens keeps the focus it takes. A menu that is opened again before it finished closing never reports that it closed, so a 400 ms timer also runs the action if it is still waiting. The wrapping is applied to items inside submenus too.

## Consequences

Running an item's action directly on select brings the lost-focus fault back. The action runs once: whichever of the close event and the timer comes first clears it. The 400 ms timer is a fallback and is listed as work to replace.
