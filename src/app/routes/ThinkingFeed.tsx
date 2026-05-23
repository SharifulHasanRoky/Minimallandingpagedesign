import { useMemo } from "react";
import { useEventStream, eventColor } from "../lib/events";
import { cn } from "../components/ui/utils";

export function ThinkingFeed() {
  const { events, connected } = useEventStream({ replay: 100, max: 500 });
  const reversed = useMemo(() => [...events].reverse(), [events]);

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
            telemetry
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Live thinking feed</h1>
        </div>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs",
            connected
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-zinc-800/60 text-zinc-500",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              connected ? "bg-emerald-400 animate-pulse" : "bg-zinc-600",
            )}
          />
          {connected ? "streaming" : "disconnected"}
        </span>
      </div>

      {reversed.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-8 text-sm text-zinc-500 text-center">
          No events yet. Send a message from the dashboard and watch the
          orchestrator + specialists work in real time.
        </div>
      ) : (
        <div className="space-y-1.5 font-mono text-xs">
          {reversed.map((e) => (
            <div
              key={e.seq}
              className="flex items-start gap-3 rounded-md border border-white/5 bg-zinc-950/40 px-3 py-2"
            >
              <span className="text-zinc-600 shrink-0 w-12">
                #{String(e.seq).padStart(4, "0")}
              </span>
              <span
                className={cn(
                  "shrink-0 w-44 truncate",
                  eventColor(e.kind),
                )}
              >
                {e.kind}
              </span>
              <span className="shrink-0 w-32 truncate text-zinc-400">
                {e.source}
              </span>
              <span className="text-zinc-300 truncate flex-1">
                {summarise(e.payload)}
              </span>
              <span className="shrink-0 text-zinc-600">
                {new Date(e.ts * 1000).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function summarise(payload: Record<string, any>): string {
  if (payload.message) return String(payload.message);
  if (payload.summary) return String(payload.summary);
  if (payload.tool) return `${payload.tool} ${JSON.stringify(payload.inputs ?? payload.outputs ?? {}).slice(0, 200)}`;
  if (payload.provider) return `${payload.provider}${payload.model ? ` (${payload.model})` : ""}`;
  if (payload.action) return `${payload.action}: ${payload.summary || ""}`;
  return JSON.stringify(payload).slice(0, 240);
}
