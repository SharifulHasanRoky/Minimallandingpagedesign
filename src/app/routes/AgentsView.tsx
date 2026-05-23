import { useEffect, useState } from "react";
import { Loader2, Play } from "lucide-react";
import { api, AgentDescriptor } from "../lib/api";
import { cn } from "../components/ui/utils";

export function AgentsView() {
  const [agents, setAgents] = useState<AgentDescriptor[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [task, setTask] = useState("");
  const [output, setOutput] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.listAgents().then(setAgents).catch(() => setAgents([]));
  }, []);

  async function invoke(name: string) {
    if (!task.trim()) return;
    setBusy(true);
    setOutput(null);
    try {
      const r = await api.invokeAgent(name, task.trim());
      setOutput(r);
    } catch (e: any) {
      setOutput({ error: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
          roster
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Agents · {agents.length} specialists
        </h1>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((a) => (
          <button
            key={a.name}
            onClick={() => setActive(a.name)}
            className={cn(
              "text-left rounded-xl border bg-zinc-900/40 p-4 transition-colors",
              active === a.name
                ? "border-violet-500/40 ring-1 ring-violet-500/20"
                : "border-white/5 hover:border-white/15",
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm text-zinc-100">{a.name}</span>
              <span
                className={cn(
                  "text-[10px] uppercase tracking-widest px-2 py-0.5 rounded",
                  a.task_kind === "code"
                    ? "bg-cyan-500/10 text-cyan-300"
                    : a.task_kind === "reason"
                    ? "bg-violet-500/10 text-violet-300"
                    : "bg-white/5 text-zinc-400",
                )}
              >
                {a.task_kind}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
              {a.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {a.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-[10px] text-zinc-500 px-1.5 py-0.5 rounded bg-white/5"
                >
                  {t}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-8 rounded-xl border border-white/10 bg-zinc-900/60 p-5">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
            invoke · {active}
          </div>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder={`Give ${active} a task…`}
            className="w-full min-h-[80px] rounded-md bg-zinc-950/60 border border-white/10 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-violet-500/30"
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => invoke(active)}
              disabled={busy || !task.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-br from-violet-500 to-cyan-500 px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Play className="size-3.5" />
              )}
              Run
            </button>
          </div>
          {output && (
            <pre className="mt-4 max-h-96 overflow-auto rounded-md bg-zinc-950/60 border border-white/5 p-3 text-xs text-zinc-300 whitespace-pre-wrap">
              {output.error ? `Error: ${output.error}` : output.result?.reply ?? JSON.stringify(output, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
