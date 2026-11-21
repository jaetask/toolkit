# 7. Every link goes through one Link component, and edit links carry ?from=

## Context

Apps use different routers, or none. The toolkit draws links in the shell and the page kit. An edit page must return the person to the spot they came from.

## Decision

Every link the toolkit draws goes through the one `Link` component in `src/suite/link.tsx`. An app with a router (React Router, TanStack) passes its own link component and current location through `LinkProvider`; an app without one gets a plain `<a>` and `window.location`. Edit links carry `?from=` set to the current path and query, so the edit page's Back, Cancel and Save return to the same spot. A `?from=` value is followed only when `safeFrom` accepts it: it must start with one `/`, must not start with `//`, and must hold no backslash, which makes it a path on the same origin. Otherwise the fallback is used.

## Consequences

A toolkit part must not render its own `<a>` for navigation, or a router app gets full page loads. The checks in `safeFrom` stop a crafted link from sending the person to another site after Save or Back; do not loosen them.
