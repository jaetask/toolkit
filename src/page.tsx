// The page kit. A read page stacks Panels at one width; each Panel's one Edit button opens that
// section's own edit page (EditFrame with labelled Rows), and Back, Cancel or Save return here.
import type { DragEvent, ReactNode } from "react";
import { Link, useFromHref } from "./link.js";
import { Button, cx, type Surface } from "./ui.js";

/** A page: title, one line, the one primary action on the right, then stacked panels. */
export function PageBody({
  title,
  line,
  action,
  children,
}: {
  title: string;
  line?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="tk-page">
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

/** A section: warm grey panel, title, one line on what it holds, at most one action on the right. */
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

/** A white card inside a panel. */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("tk-card", className)}>{children}</div>;
}

/** A small-caps label above a value inside a card. */
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
  if (disabled)
    return (
      <Button variant={variant} surface={surface} disabled>
        {children}
      </Button>
    );
  return (
    <Link href={href} className="tk-button" data-variant={variant} data-surface={surface}>
      {children}
    </Link>
  );
}

/** A grey button that opens another page and remembers this one as ?from=. */
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

/** A panel's one Edit button: opens that section's own edit page. */
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

/** The page's one dark button. */
export function PrimaryLink({ to, children }: { to: string; children: ReactNode }) {
  const href = useFromHref(to);
  return (
    <ButtonLink href={href} variant="primary">
      {children}
    </ButtonLink>
  );
}

/** Back to where you came from: the same pill on every page that has one. */
export function BackLink({ to }: { to: string }) {
  return (
    <ButtonLink href={to} surface="white">
      Back
    </ButtonLink>
  );
}

/** A list: one white card of divided rows. */
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

/** The drag type the toolkit uses for rows; Column reads it on drop. */
export const ROW_DRAG_TYPE = "application/x-tk-row";

/**
 * One list row. With `to`, the row opens its own page. With `dragId`, the row can be dragged onto
 * a Column. `blocked` marks it as waiting on something, with a word you can change.
 */
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
          {blocked && <Chip colour="amber">{blockedLabel}</Chip>}
          {aside}
        </span>
      )}
    </Tag>
  );
}

/** An empty section: a dashed card, one sentence on how to fill it, one button. */
export function EmptyCard({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="tk-empty">
      <p>{text}</p>
      {action}
    </div>
  );
}

export type Progress = "not-started" | "in-progress" | "done";
const WORD: Record<Progress, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  done: "Done",
};

/** A bare status dot, for sidebars and tight rows. */
export function Dot({ status }: { status: Progress }) {
  return <span aria-hidden className="tk-dot" data-status={status} />;
}

/** Status as a dot and a word: grey not started, orange in progress, green done. Never red. */
export function StatusDot({ status, label }: { status: Progress; label?: string }) {
  return (
    <span className="tk-status">
      <Dot status={status} />
      {label ?? WORD[status]}
    </span>
  );
}

/** The six named colours for labels, project colours and avatars. */
export const COLOURS = ["blue", "teal", "green", "amber", "purple", "pink"] as const;
export type Colour = (typeof COLOURS)[number];

/** A pill value: a label, a kind or a state, in any word. `colour` picks one of the six. */
export function Chip({ children, colour }: { children: ReactNode; colour?: Colour }) {
  return (
    <span className="tk-chip" data-colour={colour}>
      {children}
    </span>
  );
}

/** Pills to pick one value from, on an edit page. */
export function ChipPicker<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { id: T; name: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="tk-chips">
      {options.map((o) => (
        // biome-ignore lint/a11y/useSemanticElements: pills styled as buttons, with radio semantics
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          className="tk-pick"
          onClick={() => onChange(o.id)}
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}

/**
 * One edit page: title and Back, a white card of labelled Rows, then Cancel and Save. Without
 * onSave (changes save as you go) the bar shows Done.
 */
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
            <Button variant="primary" disabled={busy ?? false} onClick={onSave}>
              {busy ? "Saving…" : saveLabel}
            </Button>
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

/** A labelled row on an edit page: label and one line on the left, the inputs on the right. */
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
