# AGENTS.md

`@jaetask/toolkit`: the agent-native toolkit's parts (src/ui, icons, hooks, design-system, provider, utils), ported with the suite's look, plus the suite's own parts (src/suite). TypeScript, ESM, built with tsc, Node 22.13+. Read [README.md](README.md) first.

- **Interchangeable with agent-native**: files ported from its toolkit keep its names, props and setup (Radix, Tailwind 4, `cn`); only the theme values (src/theme/suite-theme.css) are ours. Never hand-write a part it has.
- **Suite parts** (src/suite) exist only where agent-native has no equivalent, and are built from the ui parts.
- **Move components in when an app needs them**, never ahead. Each one arrives with a render test in `src/*.test.tsx` and a place in `scripts/demo.tsx`.
- **ux-flow is the rule** for every page: [skills/ux-flow/SKILL.md](skills/ux-flow/SKILL.md). No sheets, drawers, side panels or inline editors; the one dialog is ConfirmDelete.
- **Tokens only** in the suite: colours, radii and widths are CSS variables in `src/suite/suite.css`; suite parts use the `tk-` classes.
- **Public repo**: no private package names, person names or home paths. `npm run lint` runs `scripts/check-scrub.mjs`.
- **Checks**: `npm run typecheck`, `lint`, `format:check`, `test`, `build`. Hooks in `.agents/guardrails/hooks` run them on commit and push; `npm run format` fixes formatting.
- **Branches**: push a branch, never main. `auto-pr` opens a pull request to main and it merges itself when the `ci` check passes; the pre-push hook refuses main.
- **Plain, literal language** in docs: no slogans or hype.
