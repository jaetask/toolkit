# 12. Stylesheets ship beside the compiled files, and the build checks the install first

## Context

The package is built with tsc, which does not copy CSS. `src/styles.css` pulls in the theme and suite stylesheets with relative `@import` paths and tells Tailwind where to scan with a relative `@source` path. A build after a pull that added dependencies fails with many type errors that do not name the cause.

## Decision

`scripts/finalize-build.mjs` copies every `.css` file under `src` to the same place under `dist`, as the agent-native toolkit's build does, so `dist/styles.css` and its `@import` and `@source` paths work from the published package. An app imports `styles.css` in its CSS entry after Tailwind. The `@source` line in `src/styles.css` makes Tailwind generate the classes used inside the toolkit's own files. `scripts/check-install.mjs` runs before every build (`prebuild`): when `node_modules` does not match `package-lock.json` it stops with one line telling the reader to run `npm ci`.

## Consequences

Moving a stylesheet, or changing the layout of `dist`, breaks the relative paths in `styles.css`. Without the `@source` line an app's Tailwind build leaves out the classes the toolkit's parts use. The order in the app's CSS matters: Tailwind first, then the toolkit's styles.
