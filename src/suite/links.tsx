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

export const linkHost = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^(www|m)\./, "");
  } catch {
    return "";
  }
};

export const knownService = (url: string) => SERVICES[linkHost(url)] ?? "";
export const service = (url: string) => knownService(url) || linkHost(url) || url;

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

export function AddLinkDialog({
  to,
  line = "A web address that belongs here, such as a pull request.",
  open,
  onOpenChange,
  onAdd,
}: {
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
