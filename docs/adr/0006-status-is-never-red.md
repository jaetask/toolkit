# 6. Status is shown in grey, orange or green, never red

## Context

Rows and sidebar items show progress as a dot, with or without a word.

## Decision

`StatusDot` and `Dot` in `src/suite/page.tsx` show three states: grey for not started, orange for in progress, green for done. No status is shown in red.

## Consequences

A new state for `Progress` must not use red. The dot colours are the tokens `--tk-todo`, `--tk-doing` and `--tk-done` in `src/suite/suite.css`.
