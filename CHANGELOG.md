# Changelog

## 0.3.11

- `ModelSwitcher`: Recommended and the Max usage warning are pills on the effort's line; the warning is amber with a warning icon, as in Claude.

## 0.3.10

- `ChatPane`: a line can carry `detail`, shown behind a Details toggle; a failed reply uses it for the full error.

## 0.3.9

- Readable type: suite text is never under 13px, small Tailwind text (`text-xs`) is 13px and `text-sm` is 15px. Chat messages and the composer are 15px, the Trajectory 14px. A test holds the 13px floor.

## 0.3.8

- `ModelSwitcher` works like Claude's own picker: the top models with number keys 1 to 4, an Effort submenu with only the efforts the chosen model supports (Low, Medium marked Recommended, High, Extra for `xhigh`, Max with its usage warning), and a More models submenu.
- `ModelsSettings`, a Settings section for any app: a Sync models button with the last sync time, and a table of each model's ID, release date, context window and output, efforts, and this app's use of it this month. The default model is marked.
- `ChatLayout`: the content with an optional strip on top, a divider whose position is remembered, and the chat at full height on the right. The content resizes with the divider.

## 0.3.7

- `ModelSwitcher` is one small button showing the model and effort ("Opus 5.5 Medium"). It opens a menu to pick each, the way Claude's composer does.
- `ChatPane` takes `tools`, shown in the composer next to the send button; the model button goes there.
- `ChatPane` and `Trajectory` fill the full width of their panel.

## 0.3.6

- Suite: `ChatPane`, a chat with an agent: the messages, the composer (Enter sends, Shift+Enter a new line), a Chat and Trajectory tab, a `header` slot and a `footer` slot. It takes its lines as data, so any app can use it.
- Suite: `Trajectory`, each turn as a strip with a Model lane and a Tools lane, the steps listed under it, and a dialog with a step's summary and payload. The top line sums model calls, cost and tokens.
- Suite: `ModelSwitcher`, a model and an effort picked from the lists the app passes.
- `dollars`, `seconds` and `usageOf` for showing cost and time.

## 0.3.5

- Suite: `EntityNav`, the sidebar for an app whose work lives inside entities, such as projects or brands. Each entity is a row with its mark, its name and a chevron, and opens into the same links (Intake, Backlog, Board), any of which can open into its own list (Features, articles). The entity being shown and the link holding it open by themselves; what was opened or closed is remembered in the browser under the app's `storageKey`. Pass `onMove` to reorder by dragging a handle or with the arrows, `drop` on a link to accept something dropped on it, and `menu` for the row's right-click menu.
- `toolkit-guard` knows `EntityNav`.

## 0.3.4

- Neutral greys: `--tk-panel`, `--tk-line`, `--tk-line-strong`, `--tk-muted`, `--tk-todo` and the dark surfaces are plain greys, with no warm tint. A test fails if one gets a tint again.

## 0.3.3

- Suite: working pages. `WorkPage` (one small title, what the page is for behind "?", the page's actions), `PageSection` (a small grey heading that folds, a count, a "+"), `EmptyLine`, `InlineText` (a name edited where it is shown), `RowMenu` (the "..." of a row, with menus inside it), `FormDialog` and `Field` (a short form in the centre of the page), `IconAvatar` (an icon in its colour, an emoji or a first letter), `TimeAgo` and `ago`.
- Suite: `IconAction`, a page action shown as an icon with its name as tooltip and label. The Filter button is an icon.
- ux-flow: page actions are icons, and a list or board toggle sits at the top of the Display popover.
- `FormDialog` is centred without a transform, so a part inside it that places itself by the window, such as the editor's selection toolbar, lands where it should.
- Suite: `PageControls`, `PageGroups` and `PageGroup`, the bands of a working page, with gaps that grow down the page. ux-flow: white space is the hierarchy.
- `AppShell`: the sidebar's right edge can be dragged between 200 and 440 pixels wide. The width is remembered in the browser; a double click puts back the usual width, and the arrow keys move the edge.
- `FilterMenu` options and `RowMenu` items take an `icon`, shown in the list and, for a filter, in its chip.
- `toolkit-guard` rule `room-inside`: fails a bordered box with no side padding. ux-flow: room around things.
- Suite: `FilterMenu`, one Filter button that opens the properties to filter by, with a chip for each filter in use.
- `AppShell` takes `bar={false}` to leave out the top bar, for an app whose pages carry their own title.
- `Thumbs`: a click opens the image at full size, and Remove is a small "x" shown while the thumbnail is pointed at.
- `ProjectIconPicker` takes `children` (what opens it, such as an avatar) and `title`.
- `RowMenu`: an item runs once the menu has closed and given up the focus, so a box or dialog it opens keeps the focus it takes.
- ux-flow: working pages edit in place and use dialogs for short forms; `toolkit-guard` knows the new parts.

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
