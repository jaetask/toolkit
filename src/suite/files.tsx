// Attaching files, and showing them: the paperclip, a chip for a file, a player for a video.
import { IconDownload, IconFile, IconPaperclip } from "@tabler/icons-react";
import { type ReactNode, useEffect, useRef } from "react";
import { Button } from "../ui/button.js";
import { Input } from "../ui/input.js";
import { Kbd } from "../ui/kbd.js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip.js";

/** A size as a person reads it: 812 B, 34 KB, 1.2 MB. */
export const fileSize = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/**
 * The paperclip: opens the file chooser and hands over what was chosen. With `shortcut`, Cmd or
 * Ctrl with Shift and U opens it from anywhere on the page.
 */
export function AttachButton({
  onFiles,
  label = "Attach images, files, or videos",
  accept,
  shortcut,
}: {
  onFiles: (files: File[]) => void;
  label?: string;
  /** The types the chooser offers, as a file input's accept. Any file if left out. */
  accept?: string;
  shortcut?: boolean;
}) {
  const picker = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!shortcut) return;
    const on = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || !e.shiftKey || e.key.toLowerCase() !== "u") return;
      e.preventDefault();
      picker.current?.click();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [shortcut]);
  return (
    <>
      <Input
        ref={picker}
        type="file"
        aria-label={label}
        multiple
        className="hidden"
        {...(accept ? { accept } : {})}
        onChange={(e) => {
          onFiles([...(e.target.files ?? [])]);
          e.target.value = "";
        }}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={label}
              onClick={() => picker.current?.click()}
            >
              <IconPaperclip aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            {label}
            {shortcut && <Kbd>⌘⇧U</Kbd>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}

/** A file as a chip: its name and size, and a click downloads it. `action` sits at its end. */
export function FileChip({
  name,
  size,
  href,
  action,
}: {
  name: string;
  size: number;
  href: string;
  action?: ReactNode;
}) {
  return (
    <span className="file group inline-flex max-w-full items-center gap-2 rounded-lg border bg-card py-1 pr-1 pl-2 text-sm">
      <IconFile size={16} aria-hidden className="shrink-0 text-muted-foreground" />
      <a href={href} download={name} className="min-w-0 truncate hover:underline">
        {name}
      </a>
      <span className="shrink-0 text-xs text-muted-foreground">{fileSize(size)}</span>
      <IconDownload size={14} aria-hidden className="shrink-0 text-muted-foreground" />
      {action}
    </span>
  );
}

/** A video that plays in place, with its name and size under it. `action` follows them. */
export function VideoFigure({
  name,
  size,
  src,
  action,
}: {
  name: string;
  size: number;
  src: string;
  action?: ReactNode;
}) {
  return (
    <figure className="file group m-0 grid gap-1">
      {/* biome-ignore lint/a11y/useMediaCaption: a video someone attached has no captions */}
      <video
        controls
        preload="metadata"
        src={src}
        className="max-h-[28rem] w-full rounded-lg border bg-black"
      />
      <figcaption className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="min-w-0 truncate">{name}</span>
        <span className="shrink-0">{fileSize(size)}</span>
        {action}
      </figcaption>
    </figure>
  );
}
