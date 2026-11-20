// UI primitives: buttons, inputs and the one dialog. No sheets or drawers: every edit is its own page.
import {
  type ButtonHTMLAttributes,
  forwardRef,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useId,
  useRef,
  useState,
} from "react";

export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

export type ButtonVariant = "grey" | "primary" | "danger";
/** The surface a grey button sits on: a warm grey panel (default) or a white card. */
export type Surface = "panel" | "white";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; surface?: Surface }
>(function Button({ variant = "grey", surface = "panel", className, type, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      data-variant={variant}
      data-surface={surface}
      className={cx("tk-button", className)}
      {...rest}
    />
  );
});

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cx("tk-input", className)} {...rest} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cx("tk-textarea", className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...rest }, ref) {
    return <select ref={ref} className={cx("tk-select", className)} {...rest} />;
  },
);

export function Label({ className, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  // biome-ignore lint/a11y/noLabelWithoutControl: callers pass htmlFor
  return <label className={cx("tk-row-title", className)} {...rest} />;
}

/**
 * Permanent delete, confirmed by typing the name. Archive is the everyday way to retire something;
 * this is the only dialog the toolkit has.
 */
export function ConfirmDelete({
  name,
  what = "this",
  onConfirm,
  label = "Delete",
}: {
  name: string;
  what?: string;
  onConfirm: () => void;
  label?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");
  const id = useId();
  return (
    <>
      <Button variant="danger" onClick={() => ref.current?.showModal()}>
        {label}
      </Button>
      <dialog ref={ref} className="tk-dialog" aria-labelledby={`${id}-t`}>
        <form
          method="dialog"
          className="tk-dialog-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (typed !== name) return;
            ref.current?.close();
            onConfirm();
          }}
        >
          <h2 id={`${id}-t`} className="tk-dialog-title">
            Delete {what} for good?
          </h2>
          <p className="tk-muted">
            This cannot be undone. Type <b>{name}</b> to confirm.
          </p>
          <Input
            aria-label={`Type ${name} to confirm`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
          <div className="tk-edit-bar">
            <Button surface="white" onClick={() => ref.current?.close()}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={typed !== name}>
              {label}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}

export type Children = { children?: ReactNode };
