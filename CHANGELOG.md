# Changelog

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
