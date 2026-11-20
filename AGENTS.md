# AGENTS.md

`@jaetask/toolkit`: React components and tokens that give every Kit app one shell and one page kit. TypeScript, ESM, built with tsc, Node 22.13+. Read [README.md](README.md) first.

- **Move components in when an app needs them**, never ahead. Each one arrives with a render test in `src/*.test.tsx` and a place in `scripts/demo.tsx`.
- **ux-flow is the rule** for every page: [skills/ux-flow/SKILL.md](skills/ux-flow/SKILL.md). No sheets, drawers, side panels or inline editors; the one dialog is ConfirmDelete.
- **Tokens only**: colours, radii and widths are CSS variables in `src/styles.css` with light and dark values. Components use the `tk-` classes, never inline colours.
- **Public repo**: no private package names, person names or home paths. `npm run lint` runs `scripts/check-scrub.mjs`.
- **Checks**: `npm run typecheck`, `lint`, `format:check`, `test`, `build`. Hooks in `.agents/guardrails/hooks` run them on commit and push; `npm run format` fixes formatting.
- **Demo**: `npm run demo` writes `demo/*.html`; open them to check a change looks right in light and dark.
- **Plain, literal language** in docs: no slogans or hype.
