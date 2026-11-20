// Links to other sites: the name and icon a site goes by, and the dialog that adds a link.
import {
  IconBrandFigma,
  IconBrandGithub,
  IconBrandNotion,
  IconBrandYoutubeFilled,
  IconLink,
} from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "../ui/button.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.js";
import { Input } from "../ui/input.js";
import { Label } from "../ui/label.js";

const SERVICES: Record<string, string> = {
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "github.com": "GitHub",
  "figma.com": "Figma",
  "linear.app": "Linear",
  "notion.so": "Notion",
};

/** A link's host without "www.", or "" when the text is not a web address. */
export const linkHost = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^(www|m)\./, "");
  } catch {
    return "";
  }
};

/** The name a link's site goes by: a known service, its domain, or "" for no address yet. */
export const knownService = (url: string) => SERVICES[linkHost(url)] ?? "";
/** The same, falling back to the domain, then to the text itself. */
export const service = (url: string) => knownService(url) || linkHost(url) || url;

/** The icon of a link's site: the service's own mark, or a plain link. */
export function ServiceIcon({
  url,
  size = 14,
  className,
}: {
  url: string;
  size?: number;
  className?: string;
}) {
  const name = knownService(url);
  if (name === "YouTube") {
    return (
      <IconBrandYoutubeFilled
        size={size}
        aria-hidden
        className={`text-red-600 ${className ?? ""}`}
      />
    );
  }
  const Icon =
    name === "GitHub"
      ? IconBrandGithub
      : name === "Figma"
        ? IconBrandFigma
        : name === "Notion"
          ? IconBrandNotion
          : IconLink;
  return <Icon size={size} aria-hidden className={`text-muted-foreground ${className ?? ""}`} />;
}

/**
 * The dialog that adds a link to something: its address and, if wanted, what to call it. Its
 * heading shows the site's icon. `onAdd` answers true once the link is added, which closes it.
 */
export function AddLinkDialog({
  to,
  line = "A web address that belongs here, such as a pull request.",
  open,
  onOpenChange,
  onAdd,
}: {
  /** What the link is added to, as the heading names it: "Add link to TLK-3". */
  to: string;
  line?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (url: string, title: string | undefined) => Promise<boolean>;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setUrl("");
      setTitle("");
    }
  };
  return (
    <Dialog open={open} onOpenChange={close}>
      {open && (
        <DialogContent className="max-w-md">
          {/* A form, so Enter in either box adds the link with what the boxes hold. */}
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const address = String(data.get("url") ?? "").trim();
              const name = String(data.get("title") ?? "").trim();
              if (!address) return;
              void onAdd(address, name || undefined).then((done) => done && close(false));
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ServiceIcon url={url.trim()} size={18} />
                {`Add link to ${to}`}
              </DialogTitle>
              <DialogDescription>{line}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="link-url">{`${knownService(url.trim()) || "Link"} URL`}</Label>
              <Input
                autoFocus
                id="link-url"
                name="url"
                placeholder="https://"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link-title">
                Title <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="link-title"
                name="title"
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!url.trim()}>
                Add link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
