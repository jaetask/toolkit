// Controls for list views and edit pages: tabs, pick-many chips, the composer, the filter bar,
// and a file button with a thumbnail grid.
import { type FormEvent, type ReactNode, useRef } from "react";
import { Link } from "./link.js";
import { Button, Input, type Surface } from "./ui.js";

export type TabOption<T extends string> = { id: T; name: string; count?: number; href?: string };

/**
 * Tabs above a list. With `href` on each option they are links (the current one marked); without,
 * they are buttons that call onChange.
 */
export function Tabs<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: TabOption<T>[];
  onChange?: (value: T) => void;
}) {
  const body = (o: TabOption<T>) => (
    <>
      {o.name}
      {o.count !== undefined && <span className="tk-count">{o.count}</span>}
    </>
  );
  if (options.every((o) => o.href))
    return (
      <nav className="tk-tabs" aria-label={label}>
        {options.map((o) => (
          <Link
            key={o.id}
            href={o.href ?? ""}
            className="tk-tab"
            aria-current={o.id === value ? "page" : undefined}
          >
            {body(o)}
          </Link>
        ))}
      </nav>
    );
  return (
    <div className="tk-tabs" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          className="tk-tab"
          aria-selected={o.id === value}
          onClick={() => onChange?.(o.id)}
        >
          {body(o)}
        </button>
      ))}
    </div>
  );
}

/** Pills to pick several values from, on an edit page. */
export function ChipMultiPicker<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T[];
  options: { id: T; name: string }[];
  onChange: (value: T[]) => void;
}) {
  const on = new Set(value);
  return (
    // biome-ignore lint/a11y/useSemanticElements: a row of toggle pills, not a fieldset of inputs
    <div role="group" aria-label={label} className="tk-chips">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className="tk-pick"
          aria-pressed={on.has(o.id)}
          onClick={() =>
            onChange(on.has(o.id) ? value.filter((v) => v !== o.id) : [...value, o.id])
          }
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}

/** A one-line input with its button: chat, a quick add, a reply. */
export function Composer({
  label,
  value,
  onChange,
  onSubmit,
  placeholder,
  button = "Send",
  busy,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  button?: string;
  busy?: boolean;
  maxLength?: number;
}) {
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (text && !busy) onSubmit(text);
  };
  return (
    <form className="tk-composer" onSubmit={submit}>
      <Input
        aria-label={label}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button type="submit" variant="primary" disabled={busy || !value.trim()}>
        {button}
      </Button>
    </form>
  );
}

/** The bar above a list: a search box first, then selects and toggles. */
export function FilterBar({
  children,
  label = "Filters",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a toolbar of filters, not a form that submits
    <div className="tk-filter" role="group" aria-label={label}>
      {children}
    </div>
  );
}

/** The search box for a FilterBar. */
export function SearchInput({
  value,
  onChange,
  label = "Search",
  placeholder = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}) {
  return (
    <Input
      type="search"
      className="tk-search"
      aria-label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/** A grey button that opens the file picker. */
export function FileButton({
  label,
  onFiles,
  accept = "image/png,image/jpeg,image/webp",
  multiple,
  disabled,
  surface = "white",
}: {
  label: string;
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  surface?: Surface;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button surface={surface} disabled={disabled ?? false} onClick={() => ref.current?.click()}>
        {label}
      </Button>
      <input
        ref={ref}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
    </>
  );
}

/** A grid of image thumbnails, each with a Remove button. */
export function Thumbs({
  items,
  onRemove,
  removeLabel = "Remove",
}: {
  items: { id: string; src: string; alt: string }[];
  onRemove?: (id: string) => void;
  removeLabel?: string;
}) {
  return (
    <ul className="tk-thumbs">
      {items.map((t) => (
        <li key={t.id} className="tk-thumb">
          <img src={t.src} alt={t.alt} loading="lazy" />
          {onRemove && (
            <button
              type="button"
              className="tk-thumb-remove"
              aria-label={`${removeLabel} ${t.alt}`}
              onClick={() => onRemove(t.id)}
            >
              {removeLabel}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
