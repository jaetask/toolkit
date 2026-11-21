import { createContext, type DragEvent, type ReactNode, useContext, useState } from "react";
import { Toggle } from "../ui/toggle.js";
import { ROW_DRAG_TYPE } from "./page.js";

export function Board({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <section className="tk-board" aria-label={label}>
      {children}
    </section>
  );
}

export function Column({
  id,
  title,
  kind,
  count,
  action,
  empty = "Nothing here.",
  onDrop,
  children,
}: {
  id: string;
  title: string;
  kind?: ReactNode;
  count?: number;
  action?: ReactNode;
  empty?: ReactNode;
  onDrop?: (rowId: string) => void;
  children?: ReactNode;
}) {
  const [over, setOver] = useState(false);
  const accepts = (e: DragEvent) => !!onDrop && e.dataTransfer.types.includes(ROW_DRAG_TYPE);
  const hasRows = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <section
      className="tk-column"
      aria-labelledby={`${id}-title`}
      data-over={over ? "true" : undefined}
      onDragOver={(e) => {
        if (!accepts(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!over) setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e) => {
        setOver(false);
        if (!accepts(e)) return;
        e.preventDefault();
        const rowId = e.dataTransfer.getData(ROW_DRAG_TYPE);
        if (rowId) onDrop?.(rowId);
      }}
    >
      <div className="tk-column-head">
        <h3 id={`${id}-title`} className="tk-column-title">
          {title}
        </h3>
        {kind}
        {count !== undefined && <span className="tk-count">{count}</span>}
        {action && <span className="tk-column-action">{action}</span>}
      </div>
      {hasRows ? (
        <ul className="tk-list tk-column-list">{children}</ul>
      ) : (
        <p className="tk-column-empty">{empty}</p>
      )}
    </section>
  );
}

const Depth = createContext(0);

export function Thread({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <ol className="tk-thread" aria-label={label}>
      {children}
    </ol>
  );
}

export function Comment({
  author,
  avatar,
  time,
  reactions,
  actions,
  replies,
  children,
}: {
  author: string;
  avatar?: ReactNode;
  time?: string;
  reactions?: ReactNode;
  actions?: ReactNode;
  replies?: ReactNode;
  children: ReactNode;
}) {
  const depth = useContext(Depth);
  return (
    <li className="tk-comment" data-reply={depth > 0 ? "true" : undefined}>
      {avatar}
      <div className="tk-comment-main">
        <div className="tk-comment-head">
          <span className="tk-comment-author">{author}</span>
          {time && <span className="tk-comment-time">{time}</span>}
        </div>
        <div className="tk-comment-text">{children}</div>
        {(reactions || actions) && (
          <div className="tk-comment-foot">
            {reactions}
            {actions}
          </div>
        )}
        {depth === 0 && replies && (
          <Depth.Provider value={1}>
            <ol className="tk-replies">{replies}</ol>
          </Depth.Provider>
        )}
      </div>
    </li>
  );
}

export function Reactions({
  items,
  onToggle,
}: {
  items: { emoji: string; count: number; mine?: boolean }[];
  onToggle?: (emoji: string) => void;
}) {
  return (
    <span className="tk-reactions">
      {items.map((r) => (
        <Toggle
          key={r.emoji}
          size="sm"
          variant="outline"
          className="tk-reaction"
          pressed={!!r.mine}
          aria-label={`${r.emoji} ${r.count}`}
          onPressedChange={() => onToggle?.(r.emoji)}
        >
          <span aria-hidden>{r.emoji}</span> {r.count}
        </Toggle>
      ))}
    </span>
  );
}

export function ActivityRow({
  children,
  time,
  action,
}: {
  children: ReactNode;
  time?: string;
  action?: ReactNode;
}) {
  return (
    <li className="tk-activity">
      <span className="tk-activity-dot" aria-hidden />
      <span className="tk-activity-text">{children}</span>
      {time && <span className="tk-comment-time">{time}</span>}
      {action && <span className="tk-activity-action">{action}</span>}
    </li>
  );
}

export function Facts({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="tk-card tk-facts">
      {items.map((f) => (
        <div key={f.label} className="tk-fact">
          <dt className="tk-kicker">{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CenteredPage({
  title,
  line,
  children,
}: {
  title: string;
  line?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="tk-root tk-centered">
      <section className="tk-panel tk-centered-panel" aria-labelledby="tk-centered-title">
        <div>
          <h1 id="tk-centered-title" className="tk-panel-title">
            {title}
          </h1>
          {line && <p className="tk-panel-line">{line}</p>}
        </div>
        {children}
      </section>
    </main>
  );
}
