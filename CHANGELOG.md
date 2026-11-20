# Changelog

## 0.3.0

The toolkit is now the agent-native toolkit with the suite's look, plus the suite's own parts.

- The main entry (`@jaetask/toolkit`) and `@jaetask/toolkit/ui`, `/ui/*`, `/icons`, `/hooks`, `/design-system`, `/provider` and `/utils` are the agent-native toolkit's parts, with its component names, props and setup: Radix underneath, Tailwind 4, `cn`, class-variance-authority and tw-animate-css. Only the theme values are ours (`theme/suite-theme.css`, the Marketing app's colours).
- `ResourceIcon` and `ResourceIconPicker` are the toolkit's icon and picker, with the full Tabler catalogue, emoji, colours and recents.
- The suite's own parts move to `@jaetask/toolkit/suite`: AppShell, SideSection, SideLink, PageBody (now with `wide`), Panel, Kicker, PageLink, EditLink, PrimaryLink, BackLink, ListCard, ListRow, Dot, StatusDot, EditFrame, Row, Board, Column, Thread, Comment, Reactions, ActivityRow, Facts, Composer, FileButton, Thumbs, CenteredPage, and the link helpers (`LinkProvider`, formerly `ToolkitProvider`). They are built on the ui parts. Sidebar group items take `icon` (a ResourceIcon value), several open at once and remembered; `bottom` pages sit above Settings.
- Removed in favour of the agent-native parts: the suite's Button, Input, Textarea, Label, Select, Checkbox, Tabs, Chip, ChipPicker, ChipMultiPicker, Card, Avatar, ConfirmDelete, Notice, EmptyCard, FilterBar, SearchInput and Inline.
- `toolkit-guard` also fails a raw select, button, input or textarea in app code, and looks for AppShell from `@jaetask/toolkit/suite`.

## 0.2.0

- Inter ships with the toolkit: `styles.css` loads it from `fonts/` beside it (SIL Open Font License, `fonts/OFL.txt`). Serve or bundle `dist/fonts` with the styles.
- Six named colours (`blue`, `teal`, `green`, `amber`, `purple`, `pink`) as `--tk-c-*` tokens with light and dark values; `Chip` and `Avatar` take `colour`.
- `Avatar` takes `emoji`. Its `colour` is now a named colour, not a CSS value, so it needs no inline style.
- `Board` and `Column`: columns with a title, kind chip and count; a `ListRow` with `dragId` can be dropped on a column with `onDrop`.
- `ListRow` takes `as`, `dragId`, `blocked` and `blockedLabel`; its body is a `div`. `ListCard` takes `as`.
- `Thread`, `Comment` (one level of `replies`), `Reactions` and `ActivityRow`.
- `Tabs` (buttons or links, with counts), `ChipMultiPicker`, `Composer`, `FilterBar` and `SearchInput`, `Facts`, `Notice` (inline or floating), `FileButton` and `Thumbs`, `Inline` for several controls in one `Row`, and `CenteredPage` for pages outside the shell such as sign-in.
- Nav items take `count`. Groups take `onReorder`: drag a row, or Alt+Up and Alt+Down on a focused row.

- Group items take `children`: each expands and collapses on its own with its own button, several can be open at once, and the shell remembers which ones were left open in this browser. `defaultOpen` sets the first state; `current` marks the row as the current page.
- `AppShell` takes `bottom`: pages that sit at the bottom of the sidebar, above Settings (for example Archive).

## 0.1.0

- `AppShell`, the page kit, the UI primitives and the tokens in `styles.css`.
- The ux-flow skill and `toolkit-guard`.
