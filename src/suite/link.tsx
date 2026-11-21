import { type AnchorHTMLAttributes, createContext, type ReactNode, useContext } from "react";

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children?: ReactNode;
};
export type LinkComponent = (props: LinkProps) => ReactNode;

type Routing = {
  link: LinkComponent;
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

export function Link(props: LinkProps) {
  const { link: L } = useContext(RoutingContext);
  return <L {...props} />;
}

export function withFrom(to: string, from: string): string {
  if (!from) return to;
  return `${to}${to.includes("?") ? "&" : "?"}from=${encodeURIComponent(from)}`;
}

export function useFromHref(to: string): string {
  const { location } = useContext(RoutingContext);
  return withFrom(to, location());
}

export function safeFrom(from: string | null | undefined): string | null {
  if (!from) return null;
  return from.startsWith("/") && !from.startsWith("//") && !from.includes("\\") ? from : null;
}

export function useBackTo(fallback: string): string {
  const { location } = useContext(RoutingContext);
  const query = location().split("?")[1] ?? "";
  return safeFrom(new URLSearchParams(query).get("from")) ?? fallback;
}
