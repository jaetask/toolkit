// Markdown shown as text: a comment or a description, with headings, lists, code and pictures.
import ReactMarkdown, { type Components, defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../utils.js";

const ELEMENTS = [
  "a",
  "blockquote",
  "br",
  "code",
  "del",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "hr",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "strong",
  "ul",
];

/** True for a picture the page may load: one served by the app itself. */
const ownPicture = (src: string) => src.startsWith("/") && !src.startsWith("//");

const components: Components = {
  a: ({ children, href }) => {
    const safe = href ? defaultUrlTransform(href) : "";
    if (!safe) return <>{children}</>;
    return (
      <a
        href={safe}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline-offset-2 hover:underline"
      >
        {children}
      </a>
    );
  },
  // A picture from the app is shown; one from elsewhere is a link, so opening a page asks no
  // other site for anything.
  img: ({ src, alt }) => {
    const from = typeof src === "string" ? src : "";
    if (ownPicture(from)) {
      return (
        <a href={from} target="_blank" rel="noopener noreferrer" className="my-2 block">
          <img
            src={from}
            alt={alt ?? ""}
            loading="lazy"
            className="max-h-[32rem] max-w-full rounded-lg border"
          />
        </a>
      );
    }
    const safe = defaultUrlTransform(from);
    return safe ? (
      <a href={safe} target="_blank" rel="noopener noreferrer" className="underline">
        {alt || safe}
      </a>
    ) : (
      <>{alt}</>
    );
  },
  code: ({ children, className }) => (
    <code className={cn("rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]", className)}>
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-muted p-3 text-sm [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  p: ({ children }) => <p className="m-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc ps-5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal ps-5">{children}</ol>,
  h1: ({ children }) => <h3 className="m-0 mt-2 text-lg font-semibold">{children}</h3>,
  h2: ({ children }) => <h4 className="m-0 mt-2 text-base font-semibold">{children}</h4>,
  h3: ({ children }) => <h5 className="m-0 mt-2 text-sm font-semibold">{children}</h5>,
  h4: ({ children }) => <h6 className="m-0 mt-2 text-sm font-medium">{children}</h6>,
  blockquote: ({ children }) => (
    <blockquote className="m-0 border-l-2 ps-3 text-muted-foreground">{children}</blockquote>
  ),
  hr: () => <hr className="my-3" />,
};

/** Markdown as it reads: paragraphs, headings, lists, code, links and the app's own pictures. */
export function MarkdownText({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("grid gap-2 break-words", className)}>
      <ReactMarkdown
        allowedElements={ELEMENTS}
        components={components}
        remarkPlugins={[remarkGfm]}
        skipHtml
        unwrapDisallowed
        // A picture's address is judged in `img` above; here it only has to pass through.
        urlTransform={(url, key) => (key === "src" ? url : defaultUrlTransform(url))}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
