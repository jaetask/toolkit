// Suite parts for list views and edit pages: the composer, and a file button with a thumbnail grid.
// Built on the ported ui Input and Button.
import { type FormEvent, useRef } from "react";
import { Input } from "../ui/input.js";
import { DarkButton, GreyButton, type Surface } from "./controls.js";

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
      <DarkButton type="submit" disabled={busy || !value.trim()}>
        {button}
      </DarkButton>
    </form>
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
      <GreyButton
        surface={surface}
        disabled={disabled ?? false}
        onClick={() => ref.current?.click()}
      >
        {label}
      </GreyButton>
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
            <GreyButton
              surface="white"
              size="sm"
              className="tk-thumb-remove"
              aria-label={`${removeLabel} ${t.alt}`}
              onClick={() => onRemove(t.id)}
            >
              {removeLabel}
            </GreyButton>
          )}
        </li>
      ))}
    </ul>
  );
}
