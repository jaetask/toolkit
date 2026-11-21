# 3. No ring or outline is drawn round a focused part

## Context

The ported ui parts ask for a focus ring with Tailwind's ring and outline classes. The suite's look draws none, on any part. The ported files cannot be edited to remove the classes, because they stay interchangeable with their source.

## Decision

`src/theme/suite-theme.css` turns the rings off for every element on `:focus` and `:focus-visible`: `outline: none !important` and the three Tailwind ring shadow variables set to an empty shadow with `!important`. A focused input, textarea or combobox shows a darker border in its place (`border-color: hsl(var(--ring))`). `src/suite/suite.css` does the same for the suite parts: `.tk-root :focus-visible { outline: none; }`. `src/guard.ts` has the rule `no-focus-rings`, which fails an app that asks for a ring or outline on focus as a class, or draws an `outline` in a stylesheet. The classes `outline-none`, `outline-hidden`, `ring-0` and the like ask for no ring, so the guard lets them pass.

## Consequences

The `!important` is needed to beat the classes inside the ported parts; do not remove it. A focused field is told apart only by its border colour, so `--ring` must stay visibly darker than `--input` in both light and dark values. A new part needs its own focused look that is not a ring.
