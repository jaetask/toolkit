import { IconArrowUp } from "@tabler/icons-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.js";
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

export type ModelChoice = { id: string; label: string };

export function ModelSwitcher({
  models,
  efforts,
  value,
  onChange,
  disabled,
}: {
  models: ModelChoice[];
  efforts: readonly string[];
  value: { model: string; effort: string };
  onChange: (next: { model: string; effort: string }) => void;
  disabled?: boolean;
}) {
  return (
    <div className="tk-model-switcher">
      <Select
        value={value.model}
        disabled={disabled}
        onValueChange={(model) => onChange({ ...value, model })}
      >
        <SelectTrigger aria-label="Model" className="h-8 w-auto gap-1 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {models.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={value.effort}
        disabled={disabled}
        onValueChange={(effort) => onChange({ ...value, effort })}
      >
        <SelectTrigger aria-label="Effort" className="h-8 w-auto gap-1 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {efforts.map((e) => (
            <SelectItem key={e} value={e}>
              {e}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
