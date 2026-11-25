import { IconArrowUp, IconCheck, IconChevronDown } from "@tabler/icons-react";
import {
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "../ui/button.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.js";
import { useDefaultLayout } from "react-resizable-panels";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.js";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable.js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.js";
import { Textarea } from "../ui/textarea.js";
import { cn } from "../utils.js";
import { MarkdownText } from "./markdown.js";

export type StepTokens = { input: number; output: number; cacheRead: number; cacheWrite: number };

export type ChatStepView = {
  kind: "model" | "tool";
  label: string;
  at: string;
  ms: number;
  cost?: number;
  tokens?: StepTokens;
  state?: string;
  bad?: boolean;
  detail?: unknown;
};

export type ChatLine = {
  id: string;
  from: "person" | "assistant";
  text: string;
  at: string;
  status?: "running" | "done" | "failed";
  steps?: ChatStepView[];
};

export const dollars = (cost: number): string =>
  cost === 0 ? "$0" : cost < 0.01 ? `$${cost.toFixed(4)}` : `$${cost.toFixed(2)}`;

export const seconds = (ms: number): string => `${(ms / 1000).toFixed(ms < 10_000 ? 2 : 1)}s`;

const count = (n: number) => n.toLocaleString("en-US");

export function usageOf(lines: ChatLine[]): { cost: number; calls: number; tokens: StepTokens } {
  const tokens: StepTokens = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  let cost = 0;
  let calls = 0;
  for (const step of lines.flatMap((l) => l.steps ?? [])) {
    if (step.kind !== "model") continue;
    calls += 1;
    cost += step.cost ?? 0;
    tokens.input += step.tokens?.input ?? 0;
    tokens.output += step.tokens?.output ?? 0;
    tokens.cacheRead += step.tokens?.cacheRead ?? 0;
    tokens.cacheWrite += step.tokens?.cacheWrite ?? 0;
  }
  return { cost, calls, tokens };
}

export type ModelChoice = { id: string; label: string; efforts?: readonly string[] };

const EFFORT_NAMES: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  xhigh: "Extra",
  max: "Max",
};
export const effortName = (effort: string): string =>
  EFFORT_NAMES[effort] ?? effort.charAt(0).toUpperCase() + effort.slice(1);

export function ModelSwitcher({
  models,
  more = [],
  efforts,
  recommended = "medium",
  value,
  onChange,
  disabled,
}: {
  models: ModelChoice[];
  more?: ModelChoice[];
  efforts: readonly string[];
  recommended?: string;
  value: { model: string; effort: string };
  onChange: (next: { model: string; effort: string }) => void;
  disabled?: boolean;
}) {
  const all = [...models, ...more];
  const current = all.find((m) => m.id === value.model);
  const label = current?.label ?? value.model;
  const allowed = current?.efforts ?? efforts;
  const pick = (model: ModelChoice) => {
    const next = model.efforts ?? efforts;
    onChange({
      model: model.id,
      effort: next.includes(value.effort)
        ? value.effort
        : next.includes(recommended)
          ? recommended
          : (next[0] ?? value.effort),
    });
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = Number(e.key) - 1;
    const model = models[index];
    if (model && index >= 0) {
      e.preventDefault();
      pick(model);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          aria-label={`Model: ${label}${allowed.length ? `, effort ${value.effort}` : ""}`}
          className="tk-model-button"
        >
          <span>{label}</span>
          {allowed.length > 0 && (
            <span className="tk-model-effort">{effortName(value.effort)}</span>
          )}
          <IconChevronDown size={14} aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="tk-model-menu" onKeyDown={onKey}>
        {models.map((m, index) => (
          <DropdownMenuItem key={m.id} onSelect={() => pick(m)} className="tk-model-option">
            <span>{m.label}</span>
            {m.id === value.model ? (
              <IconCheck size={14} aria-label="Chosen" className="ms-auto" />
            ) : (
              <DropdownMenuShortcut>{index + 1}</DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
        ))}
        {allowed.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="tk-model-option">
                <span>Effort</span>
                <span className="tk-model-effort ms-auto">{effortName(value.effort)}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="tk-model-menu tk-effort-menu">
                <p className="tk-model-intro">
                  Higher effort means more thorough responses, but takes longer and costs more.
                </p>
                {allowed.map((e) => (
                  <DropdownMenuItem
                    key={e}
                    onSelect={() => onChange({ ...value, effort: e })}
                    className="tk-model-option"
                  >
                    <span className="tk-effort-name">
                      <span>
                        {effortName(e)}
                        {e === recommended && <span className="tk-model-pill">Recommended</span>}
                      </span>
                      {e === "max" && <span className="tk-model-warn">3.5× or more usage</span>}
                    </span>
                    {e === value.effort && (
                      <IconCheck size={14} aria-label="Chosen" className="ms-auto" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
        {more.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="tk-model-option">
                More models
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="tk-model-menu">
                {more.map((m) => (
                  <DropdownMenuItem key={m.id} onSelect={() => pick(m)} className="tk-model-option">
                    <span>{m.label}</span>
                    {m.id === value.model && (
                      <IconCheck size={14} aria-label="Chosen" className="ms-auto" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type ModelRow = {
  id: string;
  label: string;
  releasedAt: string;
  contextWindow: number | null;
  maxOutput: number | null;
  efforts: readonly string[];
  usage: { calls: number; tokens: number; cost: number; priced: boolean };
};

const tokensShort = (n: number | null) =>
  n === null
    ? "–"
    : n >= 1_000_000
      ? `${n / 1_000_000}M`
      : n >= 1000
        ? `${Math.round(n / 1000)}K`
        : String(n);

export function ModelsSettings({
  rows,
  defaultModel,
  defaultEffort,
  syncedAt,
  syncing,
  onSync,
}: {
  rows: ModelRow[];
  defaultModel: string;
  defaultEffort: string;
  syncedAt: string | null;
  syncing?: boolean;
  onSync: () => void;
}) {
  return (
    <div className="tk-models">
      <div className="tk-models-bar">
        <span className="tk-models-synced">
          {syncedAt
            ? `Synced ${new Date(syncedAt).toLocaleString()}`
            : "Not synced yet: built-in list"}
        </span>
        <Button type="button" size="sm" variant="outline" onClick={onSync} disabled={syncing}>
          {syncing ? "Syncing…" : "Sync models"}
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead>API ID</TableHead>
            <TableHead>Released</TableHead>
            <TableHead>Context / output</TableHead>
            <TableHead>Efforts</TableHead>
            <TableHead className="text-right">This month</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((m) => (
            <TableRow key={m.id}>
              <TableCell>
                {m.label}
                {m.id === defaultModel && (
                  <span className="tk-model-pill">Default · {effortName(defaultEffort)}</span>
                )}
              </TableCell>
              <TableCell className="font-mono text-xs">{m.id}</TableCell>
              <TableCell>{m.releasedAt ? m.releasedAt.slice(0, 10) : "–"}</TableCell>
              <TableCell>
                {tokensShort(m.contextWindow)} / {tokensShort(m.maxOutput)}
              </TableCell>
              <TableCell>{m.efforts.length ? m.efforts.map(effortName).join(", ") : "–"}</TableCell>
              <TableCell className="text-right">
                {m.usage.calls
                  ? `${m.usage.calls} calls · ${count(m.usage.tokens)} tokens · ${m.usage.priced ? dollars(m.usage.cost) : "cost unknown"}`
                  : "–"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const NO_STORAGE = { getItem: () => null, setItem: () => undefined };

export function ChatLayout({
  id,
  top,
  fill,
  chat,
  children,
}: {
  id: string;
  top?: ReactNode;
  fill?: boolean;
  chat: ReactNode;
  children: ReactNode;
}) {
  const saved = useDefaultLayout({
    id,
    storage: typeof localStorage === "undefined" ? NO_STORAGE : localStorage,
    panelIds: [`${id}-content`, `${id}-chat`],
    onlySaveAfterUserInteractions: true,
  });
  return (
    <div className="tk-chat-layout">
      <ResizablePanelGroup
        orientation="horizontal"
        id={id}
        defaultLayout={saved.defaultLayout}
        onLayoutChanged={saved.onLayoutChanged}
      >
        <ResizablePanel
          id={`${id}-content`}
          defaultSize="64"
          minSize="35"
          maxSize="80"
          className="flex min-w-0"
        >
          <div className="tk-chat-layout-main">
            {top}
            <div className="tk-chat-layout-body" data-fill={fill ? "true" : undefined}>
              {children}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          aria-label="Drag to resize the chat"
          className="aria-[orientation=vertical]:h-auto aria-[orientation=vertical]:w-px aria-[orientation=vertical]:after:inset-y-0 aria-[orientation=vertical]:after:left-1/2 aria-[orientation=vertical]:after:h-auto aria-[orientation=vertical]:after:w-1 aria-[orientation=vertical]:after:-translate-x-1/2 aria-[orientation=vertical]:after:translate-y-0 [&[aria-orientation=vertical]>div]:rotate-0"
        />
        <ResizablePanel id={`${id}-chat`} minSize="20" className="flex min-w-0">
          <aside className="tk-chat-layout-chat" aria-label="Chat">
            {chat}
          </aside>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function Message({ line }: { line: ChatLine }) {
  if (line.from === "person") return <p className="tk-chat-person">{line.text}</p>;
  if (!line.text && line.status === "running") return <p className="tk-chat-note">Thinking</p>;
  return (
    <div className={cn("tk-chat-reply", line.status === "failed" && "tk-chat-failed")}>
      <MarkdownText content={line.text} />
      {line.status === "running" && <p className="tk-chat-note">Working</p>}
    </div>
  );
}

export function ChatPane({
  label,
  lines,
  busy,
  onSend,
  placeholder,
  empty,
  header,
  tools,
  footer,
  problem,
}: {
  label: string;
  lines: ChatLine[];
  busy?: boolean;
  onSend: (text: string) => void;
  placeholder?: string;
  empty?: ReactNode;
  header?: ReactNode;
  tools?: ReactNode;
  footer?: ReactNode;
  problem?: string;
}) {
  const [text, setText] = useState("");
  const [tab, setTab] = useState("chat");
  const end = useRef<HTMLDivElement>(null);
  const size = lines.length + (lines.at(-1)?.text.length ?? 0);
  useEffect(() => {
    if (size) end.current?.scrollIntoView?.({ block: "end" });
  }, [size]);
  const send = (e?: FormEvent) => {
    e?.preventDefault();
    const said = text.trim();
    if (!said || busy) return;
    setText("");
    onSend(said);
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };
  return (
    <Tabs value={tab} onValueChange={setTab} className="tk-chat" aria-label={`Chat with ${label}`}>
      <div className="tk-chat-head">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="trajectory">Trajectory</TabsTrigger>
        </TabsList>
        {header}
      </div>
      <TabsContent value="chat" className="tk-chat-body">
        <div className="tk-chat-lines">
          {lines.length ? (
            lines.map((line) => <Message key={line.id} line={line} />)
          ) : (
            <div className="tk-chat-empty">{empty}</div>
          )}
          <div ref={end} />
        </div>
        <form className="tk-chat-composer" onSubmit={send}>
          <Textarea
            aria-label={`Message ${label}`}
            value={text}
            rows={3}
            maxLength={8000}
            placeholder={placeholder ?? `Message ${label}…`}
            className="min-h-16 resize-none border-0 bg-transparent p-1 shadow-none"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
          />
          <div className="tk-chat-send">
            {tools}
            <Button
              type="submit"
              size="icon"
              className="size-8 rounded-full"
              aria-label="Send"
              title="Send"
              disabled={!text.trim() || busy}
            >
              <IconArrowUp size={16} />
            </Button>
          </div>
        </form>
      </TabsContent>
      <TabsContent value="trajectory" className="tk-chat-body">
        <Trajectory lines={lines} />
      </TabsContent>
      {problem ? (
        <p className="tk-chat-problem" role="alert">
          {problem}
        </p>
      ) : (
        footer && <div className="tk-chat-foot">{footer}</div>
      )}
    </Tabs>
  );
}

type Picked = { turn: number; step: ChatStepView };

export function Trajectory({ lines }: { lines: ChatLine[] }) {
  const [picked, setPicked] = useState<Picked | null>(null);
  const turns = lines.filter((l) => (l.steps?.length ?? 0) > 0);
  const usage = usageOf(lines);
  if (!turns.length) return <p className="tk-chat-empty">No model calls yet.</p>;
  return (
    <div className="tk-trajectory">
      <p className="tk-trajectory-usage">
        {usage.calls} model call{usage.calls === 1 ? "" : "s"} · {dollars(usage.cost)} ·{" "}
        {count(usage.tokens.input + usage.tokens.cacheRead + usage.tokens.cacheWrite)} in (
        {count(usage.tokens.cacheRead)} from cache) · {count(usage.tokens.output)} out
      </p>
      {turns.map((line, index) => (
        <TurnStrip key={line.id} turn={index + 1} line={line} onPick={setPicked} />
      ))}
      <StepDetails picked={picked} onClose={() => setPicked(null)} />
    </div>
  );
}

function TurnStrip({
  turn,
  line,
  onPick,
}: {
  turn: number;
  line: ChatLine;
  onPick: (picked: Picked) => void;
}) {
  const steps = line.steps ?? [];
  const start = Math.min(...steps.map((s) => Date.parse(s.at)));
  const end = Math.max(...steps.map((s) => Date.parse(s.at) + s.ms));
  const span = Math.max(end - start, 1);
  const cost = steps.reduce((sum, s) => sum + (s.cost ?? 0), 0);
  return (
    <section className="tk-turn" aria-label={`Turn ${turn}`}>
      <p className="tk-turn-head">
        <span>Turn {turn}</span>
        <span>
          {seconds(end - start)} · {dollars(cost)}
        </span>
      </p>
      <div className="tk-turn-plot">
        {(["model", "tool"] as const).map((lane) => (
          <div key={lane} className="tk-turn-lane">
            <span className="tk-turn-lane-name">{lane === "model" ? "Model" : "Tools"}</span>
            <div className="tk-turn-track">
              {steps
                .filter((s) => s.kind === lane)
                .map((s) => {
                  const left = (Date.parse(s.at) - start) / span;
                  const style: CSSProperties = {
                    left: `${(left * 100).toFixed(2)}%`,
                    width: `max(3px, ${((s.ms / span) * 100).toFixed(2)}%)`,
                  };
                  const tip = `${s.label} · ${seconds(s.ms)}${s.cost != null ? ` · ${dollars(s.cost)}` : ""}`;
                  return (
                    <button
                      key={`${s.at}-${s.label}`}
                      type="button"
                      className={cn("tk-turn-bar", s.kind, s.bad && "bad")}
                      style={style}
                      title={tip}
                      aria-label={tip}
                      onClick={() => onPick({ turn, step: s })}
                    />
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      <ol className="tk-turn-steps">
        {steps.map((s) => (
          <li key={`${s.at}-${s.label}-row`}>
            <button type="button" onClick={() => onPick({ turn, step: s })}>
              <span className={cn("tk-turn-tag", s.kind, s.bad && "bad")}>
                {s.kind === "model" ? "Model" : "Tool"}
              </span>
              <span className="tk-turn-label">{s.label}</span>
              <span className="tk-turn-meta">
                {seconds(s.ms)}
                {s.cost != null ? ` · ${dollars(s.cost)}` : ""}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

const Pre = ({ value }: { value: unknown }) => (
  <pre className="tk-turn-pre">
    {typeof value === "string" ? value : JSON.stringify(value, null, 1)}
  </pre>
);

function StepDetails({ picked, onClose }: { picked: Picked | null; onClose: () => void }) {
  const step = picked?.step;
  return (
    <Dialog open={!!picked} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {step && (
          <>
            <DialogHeader>
              <DialogTitle className="text-sm">
                Turn {picked.turn} · {step.label}
              </DialogTitle>
              <DialogDescription className="sr-only">
                One step of the conversation.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="summary">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="payload">Payload</TabsTrigger>
              </TabsList>
              <TabsContent value="summary">
                <Pre
                  value={{
                    kind: step.kind,
                    at: step.at,
                    took: seconds(step.ms),
                    ...(step.state ? { state: step.state } : {}),
                    ...(step.cost != null ? { cost: dollars(step.cost) } : {}),
                    ...(step.tokens ? { tokens: step.tokens } : {}),
                  }}
                />
              </TabsContent>
              <TabsContent value="payload">
                <Pre value={step.detail ?? "(nothing saved)"} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
