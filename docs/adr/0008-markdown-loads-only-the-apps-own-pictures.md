# 8. Markdown shows only pictures served by the app; others become links

## Context

Comments and descriptions are Markdown written by people and agents. A picture address in that text could point at any site, and loading it would tell that site the page was opened.

## Decision

In `src/suite/markdown.tsx`, a picture whose address starts with one `/` (and not `//`) is served by the app and is shown. A picture from anywhere else is drawn as a link, so opening a page asks no other site for anything. The `urlTransform` passed to ReactMarkdown lets a `src` through unchanged, because the address is judged in the `img` component; every other address goes through `defaultUrlTransform`. The `img` component still runs `defaultUrlTransform` on an outside address before it makes the link.

## Consequences

Do not add a URL transform for `src` in place of the pass-through without keeping the check in `img`: the check is what decides. Allowing pictures from other hosts changes what opening a page reveals. Raw HTML is skipped and only the listed elements are allowed.
