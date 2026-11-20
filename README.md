# @jaetask/toolkit

The agent-native toolkit's parts with the suite's look, plus the suite's shell and page kit, so every Kit app looks and works the same.

![The suite shell with the ported Button, Input, Select (open), Tabs, ToggleGroup, Checkbox and Popover, and an edit page with the ResourceIconPicker.](docs/read.png)

## Install

```bash
npm install @jaetask/toolkit react react-dom
npm install -D tailwindcss @tailwindcss/cli
```

## Set up an app

The ui parts are styled with Tailwind 4, as in the agent-native toolkit. The app's CSS entry:

```css
@import "tailwindcss";
@import "@jaetask/toolkit/styles.css";
@source "./**/*.{ts,tsx}";
```

Build it with Tailwind (`npx @tailwindcss/cli -i app.css -o public/app.css`), load Inter in the page (for example `import "@fontsource-variable/inter"`), and, when bundling with esbuild rather than Vite, define `import.meta.env` (for example `--define:import.meta.env='{"SSR":false,"MODE":"production","DEV":false}'`).

`styles.css` carries the suite's theme (`theme/suite-theme.css`): the `--background`, `--foreground`, `--primary` and other variables the ui parts read, with light values on `:root` and dark ones under `.dark`.

## Use

The ui parts have the agent-native toolkit's names and props:

```tsx
import { Button } from "@jaetask/toolkit/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jaetask/toolkit/ui/select";
import { ResourceIconPicker } from "@jaetask/toolkit/icons";
```

The suite's shell and page kit, built on those parts:

```tsx
import { AppShell, EditFrame, PageBody, Panel, Row, EditLink } from "@jaetask/toolkit/suite";
```

## What is in it

| Entry                                             | Holds                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@jaetask/toolkit`                                | Everything below except the suite, as the agent-native toolkit's main entry exports it.                                                                                                                                                                                                                                                                                       |
| `/ui`, `/ui/*`                                    | The ui parts: accordion, alert, alert-dialog, avatar, badge, button, card, checkbox, collapsible, command, context-menu, dialog, dropdown-menu, empty, form, hover-card, input, label, popover, select, separator, skeleton, switch, tabs, textarea, toggle, toggle-group, tooltip and the rest.                                                                              |
| `/icons`                                          | `ResourceIcon` and `ResourceIconPicker`, with the Tabler catalogue, emoji, colours and recents.                                                                                                                                                                                                                                                                               |
| `/hooks`, `/design-system`, `/provider`, `/utils` | What the ui parts rely on, including `cn`.                                                                                                                                                                                                                                                                                                                                    |
| `/suite`                                          | The suite's parts: `AppShell`, `SideSection`, `SideLink`, `PageBody`, `Panel`, `EditFrame`, `Row`, `EditLink`, `PageLink`, `PrimaryLink`, `BackLink`, `ListCard`, `ListRow`, `StatusDot`, `Board`, `Column`, `Thread`, `Comment`, `Reactions`, `ActivityRow`, `Facts`, `Composer`, `FileButton`, `Thumbs`, `CenteredPage`, `Kicker`, and `LinkProvider` for the app's router. |
| `/styles.css`                                     | The Tailwind setup, the theme and the suite's styles.                                                                                                                                                                                                                                                                                                                         |

## The ux-flow skill

[skills/ux-flow](skills/ux-flow/SKILL.md) is the rule these components follow. Install it in an app:

```bash
npx skills add jaetask/toolkit --skill ux-flow
```

## toolkit-guard

`npx toolkit-guard src` fails when an app hand-builds what the toolkit has:

| Rule            | Fails when                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| `own-kit`       | The app defines its own AppShell, Sidebar, Panel, EditFrame, Row, ListRow or another toolkit component. |
| `tokens-only`   | App code or CSS holds a literal colour instead of a `--tk-` token.                                      |
| `shell-present` | No file imports `AppShell` from `@jaetask/toolkit`.                                                     |

A line that must keep a literal ends with the comment `toolkit-guard-allow`.

## Changes

Push a branch, never main. A pull request to main opens by itself and merges when the `ci` check passes.

## Credit

The ui parts, icons, hooks, design-system, provider and utils are ported from the toolkit of [agent-native](https://github.com/BuilderIO/agent-native) (MIT, Copyright (c) 2026 Builder.io, Inc.), with the suite's theme.

## Licence

MIT. See [LICENSE](LICENSE).
