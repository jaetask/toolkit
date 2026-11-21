---

name: ux-flow
description: Show and edit an app's data the same way on every page, so users know the next page before it lands. Use when building or changing any page that shows or edits data.
---

# UX flow

![A read page stacks sections; Edit opens that section's own edit page in the same frame, and Back, Cancel or Save return to the same spot.](ux-flow.svg)

Every Kit app feels the same. The user reads, edits, and lands back where they were.

- **Read page.** Sections stacked at one width. Each has a title, one line on what it holds, and its data, read-only. A list row opens its own page.
- **Working page.** A page people work on all day (a board, a list, settings) uses `WorkPage`: one small title, what the page is for behind "?", its actions on the right, and its lists straight on the page. A section is a `PageSection`: a small grey heading that folds, a count, a "+".
- **Edit in place.** On a working page a name is changed where it is shown (`InlineText`): click, type, Enter saves, Escape cancels. Everything else that can be done to a row is in its "..." (`RowMenu`).
- **A short form is a dialog.** Making something new, or changing several fields at once, opens a `FormDialog` in the centre: fields, Cancel, one button that saves.
- **White space is the hierarchy.** A working page has three bands: the title, its controls (`PageControls`: search, filter, ticks, tabs), then the content. The gap grows down the page: title to controls 24px, controls to content 32px, group to group 28px (`PageGroups`, `PageGroup`), a group's heading to its list 10px. Never the same gap everywhere, and no band pressed against the next.
- **Room around things.** Nothing touches an edge. Text in a box that can show a border has at least 12px of padding inside it; a box that must line up with text around it gets the padding and a matching negative margin. A dialog's content sits 24px from its edge, and a handle or icon that appears beside text has space on both sides. When in doubt, more space.
- **Icons, not words.** A page's actions are icon buttons (`IconAction`): the icon shows, its name is the tooltip and the label. Words stay where no icon says it, and on the one button that saves a form.
- **List or board.** Where the same things can be shown as a list or as a board, one toggle at the top of the Display popover switches between them, and the page remembers the choice.
- **Edit page.** A long form keeps its own page: the read page's width and frame, Back at the top, labelled rows, Cancel and Save at the bottom; both return to the same spot (`?from=`).
- **One home per field.** Each value is edited on exactly one page.
- **One way in.** A value is changed the same way wherever it shows.
- **One sidebar per side.** We do not want multiple sidebars on the same page. If you load one sidebar and then another, we don't want content being hidden by multiple sidebars. For example, when the agent chat is docked on the right (as in a file reader, content left and chat right), never open a drawer or sheet over it on that side.
- **Modals are fine.** A pop-up modal that takes the centre of the stage, lets you do your thing, and closes back to what you were doing is a normal pattern. Popovers and menus are fine too.
- **Colours are swatches.** A colour is chosen from round swatches (and a custom colour input), never from a list of colour names.
- **Real data.** Show what is stored or computed from it; an empty section says how to fill it.
- **Deliberate delete.** Archive first. Permanent delete confirms by name. No solid red button on a page: what removes sits in the "..." menu.

1. Build from `@jaetask/toolkit`: the ui parts (`@jaetask/toolkit/ui`), and `Panel`, `ListRow`, `EditLink`, `EditFrame`, `Row`, `BackLink`, `WorkPage`, `PageSection`, `InlineText`, `RowMenu`, `FormDialog`, `ProjectIconPicker`, inside `AppShell` (`@jaetask/toolkit/suite`). A missing piece goes into the toolkit, never a single page.
2. Run `npx toolkit-guard src` with the app's lint. It fails on a hand-built shell or kit component, a raw browser control, a colour chosen by name, a literal colour, a ring or outline drawn on focus, or a bordered box with no padding inside, and names the toolkit piece to use.
