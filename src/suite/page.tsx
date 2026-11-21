import type { DragEvent, ReactNode } from "react";
import { Link, useFromHref } from "./link.js";
import { Badge } from "../ui/badge.js";
import { DarkButton, GreyButton, type Surface } from "./controls.js";

export function PageBody({
  title,
  line,
  action,
  wide,
  children,
}: {
  title: string;
  line?: ReactNode;
  action?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="tk-page" data-wide={wide ? "true" : undefined}>
      <div className="tk-page-head">
        <div>
          <h1 className="tk-page-title">{title}</h1>
          {line && <p className="tk-page-line">{line}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Panel({
  id,
  title,
  line,
  action,
  children,
}: {
  id: string;
  title: string;
  line?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="tk-panel">
      <div className="tk-panel-head">
        <div>
          <h2 id={`${id}-title`} className="tk-panel-title">
            {title}
          </h2>
          {line && <p className="tk-panel-line">{line}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <span className="tk-kicker">{children}</span>;
}

function ButtonLink({
  href,
  variant = "grey",
  surface = "panel",
  disabled,
  children,
}: {
  href: string;
  variant?: "grey" | "primary";
  surface?: Surface;
  disabled?: boolean;
  children: ReactNode;
}) {
  if (variant === "primary")
    return disabled ? (
      <DarkButton disabled>{children}</DarkButton>
    ) : (
      <DarkButton asChild>
        <Link href={href}>{children}</Link>
      </DarkButton>
    );
  return disabled ? (
    <GreyButton surface={surface} disabled>
      {children}
    </GreyButton>
  ) : (
    <GreyButton surface={surface} asChild>
      <Link href={href}>{children}</Link>
    </GreyButton>
  );
}

export function PageLink({
  to,
  children,
  disabled,
  surface,
}: {
  to: string;
  children: ReactNode;
  disabled?: boolean;
  surface?: Surface;
}) {
  const href = useFromHref(to);
  return (
    <ButtonLink href={href} surface={surface ?? "panel"} disabled={disabled ?? false}>
      {children}
    </ButtonLink>
  );
}

export function EditLink({
  to,
  label = "Edit",
  disabled,
}: {
  to: string;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <PageLink to={to} disabled={disabled ?? false}>
      {label}
    </PageLink>
  );
}

export function PrimaryLink({ to, children }: { to: string; children: ReactNode }) {
  const href = useFromHref(to);
  return (
    <ButtonLink href={href} variant="primary">
      {children}
    </ButtonLink>
  );
}

export function BackLink({ to }: { to: string }) {
  return (
    <ButtonLink href={to} surface="white">
      Back
    </ButtonLink>
  );
}

export function ListCard({
  children,
  as = "ul",
}: {
  children: ReactNode;
  as?: "ul" | "ol" | "div";
}) {
  const Tag = as;
  return <Tag className="tk-list">{children}</Tag>;
}

export const ROW_DRAG_TYPE = "application/x-tk-row";

export function ListRow({
  to,
  children,
  aside,
  as = "li",
  dragId,
  blocked,
  blockedLabel = "Blocked",
}: {
  to?: string;
  children: ReactNode;
  aside?: ReactNode;
  as?: "li" | "div" | "article";
  dragId?: string;
  blocked?: boolean;
  blockedLabel?: string;
}) {
  const href = useFromHref(to ?? "");
  const Tag = as;
  const drag = dragId
    ? {
        draggable: true,
        onDragStart: (e: DragEvent<HTMLElement>) => {
          e.dataTransfer.setData(ROW_DRAG_TYPE, dragId);
          e.dataTransfer.effectAllowed = "move";
        },
      }
    : {};
  return (
    <Tag className="tk-list-row" data-blocked={blocked ? "true" : undefined} {...drag}>
      {to ? (
        <Link href={href} className="tk-list-body" draggable={dragId ? false : undefined}>
          {children}
        </Link>
      ) : (
        <div className="tk-list-body">{children}</div>
      )}
      {(aside || blocked) && (
        <span className="tk-list-aside">
          {blocked && (
            <Badge variant="outline" className="tk-blocked">
              {blockedLabel}
            </Badge>
          )}
          {aside}
        </span>
      )}
    </Tag>
  );
}

export type Progress = "not-started" | "in-progress" | "done";
const WORD: Record<Progress, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  done: "Done",
};

export function Dot({ status }: { status: Progress }) {
  return <span aria-hidden className="tk-dot" data-status={status} />;
}

export function StatusDot({ status, label }: { status: Progress; label?: string }) {
  return (
    <span className="tk-status">
      <Dot status={status} />
      {label ?? WORD[status]}
    </span>
  );
}

export function EditFrame({
  title,
  line,
  backTo,
  children,
  onSave,
  busy,
  saveLabel = "Save",
  extra,
}: {
  title: string;
  line?: ReactNode;
  backTo: string;
  children: ReactNode;
  onSave?: () => void;
  busy?: boolean;
  saveLabel?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="tk-edit">
      <div className="tk-page-head">
        <div>
          <h1 className="tk-page-title">{title}</h1>
          {line && <p className="tk-page-line">{line}</p>}
        </div>
        <BackLink to={backTo} />
      </div>
      <div className="tk-edit-card">{children}</div>
      <div className="tk-edit-bar">
        {extra && <span className="tk-edit-extra">{extra}</span>}
        {onSave ? (
          <>
            <ButtonLink href={backTo} surface="white">
              Cancel
            </ButtonLink>
            <DarkButton disabled={busy ?? false} onClick={onSave}>
              {busy ? "Saving…" : saveLabel}
            </DarkButton>
          </>
        ) : (
          <ButtonLink href={backTo} variant="primary">
            Done
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

export function Row({
  title,
  line,
  htmlFor,
  children,
}: {
  title: string;
  line?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="tk-row">
      <div className="tk-row-label">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="tk-row-title">
            {title}
          </label>
        ) : (
          <span className="tk-row-title">{title}</span>
        )}
        {line && <span className="tk-row-line">{line}</span>}
      </div>
      <div className="tk-row-fields">{children}</div>
    </div>
  );
}
