// Links and the way back. Every link the toolkit draws goes through one Link component, so an app
// with a router (React Router, TanStack) passes its own, and an app without one gets a plain <a>.
// Edit links carry ?from= so the edit page's Back, Cancel and Save return to the same spot.
import { type AnchorHTMLAttributes, createContext, type ReactNode, useContext } from "react";

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children?: ReactNode;
};
export type LinkComponent = (props: LinkProps) => ReactNode;

type Routing = {
  /** The app's link component. Defaults to a plain <a>. */
  link: LinkComponent;
  /** The current path and query, used for ?from=. Defaults to window.location. */
  location: () => string;
};

const PlainLink: LinkComponent = ({ href, children, ...rest }) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

const browserLocation = () =>
  typeof window === "undefined" ? "" : window.location.pathname + window.location.search;

const RoutingContext = createContext<Routing>({ link: PlainLink, location: browserLocation });

/** Gives the toolkit the app's router: its link component and its current location. */
export function LinkProvider({
  link,
  location,
  children,
}: {
  link?: LinkComponent;
  location?: string | (() => string);
  children: ReactNode;
}) {
  const value: Routing = {
    link: link ?? PlainLink,
    location: typeof location === "string" ? () => location : (location ?? browserLocation),
  };
  return <RoutingContext.Provider value={value}>{children}</RoutingContext.Provider>;
}

/** The app's link component. */
export function Link(props: LinkProps) {
  const { link: L } = useContext(RoutingContext);
  return <L {...props} />;
}

/** `to` with ?from= set to the given location. */
export function withFrom(to: string, from: string): string {
  if (!from) return to;
  return `${to}${to.includes("?") ? "&" : "?"}from=${encodeURIComponent(from)}`;
}

/** `to` with ?from= set to the current location. */
export function useFromHref(to: string): string {
  const { location } = useContext(RoutingContext);
  return withFrom(to, location());
}

/** A ?from= value that is safe to follow: a same-origin path. */
export function safeFrom(from: string | null | undefined): string | null {
  if (!from) return null;
  return from.startsWith("/") && !from.startsWith("//") && !from.includes("\\") ? from : null;
}

/** Where an edit page's Back goes: the ?from= path when it is safe, else the fallback. */
export function useBackTo(fallback: string): string {
  const { location } = useContext(RoutingContext);
  const query = location().split("?")[1] ?? "";
  return safeFrom(new URLSearchParams(query).get("from")) ?? fallback;
}
