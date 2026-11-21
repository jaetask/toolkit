import { IconX } from "@tabler/icons-react";
import { type FormEvent, useRef, useState } from "react";
import { Button } from "../ui/button.js";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog.js";
import { Input } from "../ui/input.js";
import { DarkButton, GreyButton, type Surface } from "./controls.js";

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

export function Thumbs({
  items,
  onRemove,
  removeLabel = "Remove",
}: {
  items: { id: string; src: string; alt: string }[];
  onRemove?: (id: string) => void;
  removeLabel?: string;
}) {
  const [shown, setShown] = useState<string | null>(null);
  const full = items.find((t) => t.id === shown);
  return (
    <>
      <ul className="tk-thumbs">
        {items.map((t) => (
          <li key={t.id} className="tk-thumb">
            <Button
              variant="ghost"
              className="tk-thumb-open"
              aria-label={`Open ${t.alt}`}
              onClick={() => setShown(t.id)}
            >
              <img src={t.src} alt={t.alt} loading="lazy" />
            </Button>
            {onRemove && (
              <Button
                variant="secondary"
                size="icon-xs"
                className="tk-thumb-remove"
                aria-label={`${removeLabel} ${t.alt}`}
                onClick={() => onRemove(t.id)}
              >
                <IconX aria-hidden />
              </Button>
            )}
          </li>
        ))}
      </ul>
      <Dialog open={!!full} onOpenChange={(open) => !open && setShown(null)}>
        {full && (
          <DialogContent className="w-auto max-w-[95vw] p-2">
            <DialogTitle className="sr-only">{full.alt}</DialogTitle>
            <DialogDescription className="sr-only">The image at full size.</DialogDescription>
            <img src={full.src} alt={full.alt} className="max-h-[85vh] max-w-full rounded-md" />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
