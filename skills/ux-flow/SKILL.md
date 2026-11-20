---

name: ux-flow
description: Show and edit an app's data the same way on every page, so users know the next page before it lands. Use when building or changing any page that shows or edits data.
---

# UX flow

![A read page stacks sections; Edit opens that section's own edit page in the same frame, and Back, Cancel or Save return to the same spot.](ux-flow.svg)

Every Kit app feels the same. The user reads, edits, and lands back where they were.

- **Read page.** Sections stacked at one width. Each has a title, one line on what it holds, and its data, read-only. A list row opens its own page.
- **Edit.** One button per section. It opens that section's own edit page and carries the way back (`?from=`).
- **Edit page.** The read page's width and frame. Back at the top. Labelled rows: label and one line on the left, input on the right. Cancel and Save at the bottom; both return to the same spot.
- **One home per field.** Each value is edited on exactly one page.
- **One way in.** Every edit takes this trip.
- **One sidebar per side.** We do not want multiple sidebars on the same page. If you load one sidebar and then another, we don't want content being hidden by multiple sidebars. For example, when the agent chat is docked on the right (as in a file reader, content left and chat right), never open a drawer or sheet over it on that side.
- **Modals are fine.** A pop-up modal that takes the centre of the stage, lets you do your thing, and closes back to what you were doing is a normal pattern. Popovers and menus are fine too.
- **Colours are swatches.** A colour is chosen from round swatches (and a custom colour input), never from a list of colour names.
- **Real data.** Show what is stored or computed from it; an empty section says how to fill it.
- **Deliberate delete.** Archive first. Permanent delete confirms by name.

1. Build from `@jaetask/toolkit`: the ui parts (`@jaetask/toolkit/ui`), and `Panel`, `ListRow`, `EditLink`, `EditFrame`, `Row`, `BackLink`, `ProjectIconPicker`, inside `AppShell` (`@jaetask/toolkit/suite`). A missing piece goes into the toolkit, never a single page.
2. Run `npx toolkit-guard src` with the app's lint. It fails on a hand-built shell or kit component, a raw browser control, a colour chosen by name, a literal colour, or a ring or outline drawn on focus, and names the toolkit piece to use.
