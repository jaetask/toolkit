# 4. The suite's look is carried as the theme variables the ui parts read

## Context

The ported ui parts read their colours and radius from CSS variables (`--background`, `--foreground`, `--primary` and others). The suite needs its own look without changing the ported files.

## Decision

`src/theme/suite-theme.css` sets those variables: light values on `:root`, dark values under `.dark`. The values are the ones the suite's Marketing app uses. The page background is a very light grey, so that white cards and threads stand out on it. The sidebar is one step greyer than the page. An app can override any variable after it imports `styles.css`.

## Consequences

The look changes by editing values in `src/theme/suite-theme.css`, not by editing ported parts. Making `--background` white removes the contrast that cards and threads rely on. The suite parts have their own tokens in `src/suite/suite.css`; a change of look may need both files.
