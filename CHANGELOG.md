# Changelog

## 0.3.2

- `PropertyPicker`: the search line runs the full width; `anchor`, `side` and `align` open the list from a fixed part and a chosen side.
- Suite: `MarkdownText`, Markdown shown as text with headings, lists, code, links and the app's own pictures. A picture from another site is shown as a link.
- Light theme: the page is a very light grey and the sidebar a step greyer, so white cards and comment threads stand out.
- `toolkit-guard` rule `no-focus-rings`: fails a class that asks for a ring or outline on focus, and a drawn `outline` in CSS.
- No focus rings: no part draws a ring or an outline when focused. A focused field shows a darker border.
- `PropertyPicker`: roomier rows with a gap after the icon, no search icon, and a tick box at the start of each row when several can be chosen.
- Suite: files. `AttachButton` (the paperclip, with its tooltip and Cmd+Shift+U), `FileChip` (name, size, download), `VideoFigure` (a video that plays in place) and `fileSize`.
- Suite: due dates. `DueDatePicker` (type "tomorrow", "7 days" or "Feb 9", pick a row, or a calendar; Shift+D opens it), `DueIcon`, `dueLabel` and `dueState`, with the parser behind them: `parseDue`, `endOfWeek`, `day`.
- Suite: `ViewToggle`, the icon buttons that choose how a board is grouped, and `PropertyPills`, on and off pills such as the properties a card shows.
- Suite: links to other sites. `ServiceIcon` (YouTube, GitHub, Figma, Notion, or a plain link), `service`, `knownService` and `linkHost` name a link's site, and `AddLinkDialog` asks for an address and an optional title.
- Suite: `PropertyPicker`, a row that opens a searchable list in a popover (a key that opens it, number keys, pick several with the chosen ones above a line, create from what was typed), and `RailRow`, the quiet row it opens from.

## 0.3.1

- Select's highlighted row is light grey (`focus:bg-accent`), with the tick on the chosen one; the emoji search says "Search emoji...".
- Suite: the agent-native Content app's emoji reactions: `EmojiPickerPanel` (search, then the categories), `filterEmojiCategories`, `CommentReactionChips`, `AddReactionButton` (quick reactions, then the searchable panel, in a Popover) and `CommentIconButton`.
- `@jaetask/toolkit/editor` (and `/editor/*`, `/editor.css`): agent-native's Notion-style editor on Tiptap 3.28: SharedRichEditor, RichMarkdownEditor (Markdown in and out), SlashCommandMenu with DEFAULT_SLASH_COMMANDS, BubbleToolbar, code blocks with lowlight, images and the rest, with `/collab-ui` for its optional collaboration parts.
- `@jaetask/toolkit/app/review`: InlineMarkdown, for rendering Markdown in comments and descriptions.
- `AppShell` takes `side`: the app's own navigation, drawn under the pages (for example its projects), told whether the sidebar is collapsed.
- ux-flow: popovers, menus, sheets and dialogs are allowed; the rule is one sidebar on a page, so a second sidebar never hides content. `toolkit-guard` no longer fails a sheet or drawer import.
- `npm run build` first checks node_modules against package-lock.json and says to run `npm ci` when they differ.
- `ProjectIcon` and `ProjectIconPicker` (suite) are the earlier Tasks app's "Icon & colour" picker: ten round swatches with a tick, a custom colour, icon search and a six-column grid of 28 Tabler icons in the chosen colour. `ColourSwatches` is the swatches and custom colour on their own, for any colour; `PROJECT_COLOURS`, `PROJECT_ICONS` and `DEFAULT_PROJECT_COLOUR` come with it. Sidebar group items take `projectIcon` and `iconColour`.
- `toolkit-guard` fails a colour chosen from a list of colour names (`colour-swatches`); the ux-flow skill says colours are swatches.

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
