import { useEffect, useState } from "react";
import { Activity, Bot, Boxes, Plug, Workflow } from "lucide-react";
import { CommandBar } from "../components/CommandBar";
import { api } from "../lib/api";
import { cn } from "../components/ui/utils";

export function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [reply, setReply] = useState<{
    reply: string;
    used_provider?: string | null;
    used_model?: string | null;
    plan?: any[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const s = await api.summary();
      setSummary(s);
      setError(null);
    } catch (e: any) {
      setError(e.message || "failed");
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
          command center
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Good to see you. What are we shipping today?
        </h1>
      </div>

      <CommandBar onReply={(r) => setReply(r)} />

      {reply && (
        <div className="mt-6 rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl p-5">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
            <span>orchestrator reply</span>
            {reply.used_provider && (
              <span className="text-violet-300">
                · {reply.used_provider}/{reply.used_model}
              </span>
            )}
            {reply.plan && reply.plan.length > 0 && (
              <span className="text-cyan-300">· {reply.plan.length} step plan</span>
            )}
          </div>
          <div className="text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
            {reply.reply}
          </div>
          {reply.plan && reply.plan.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {reply.plan.map((s: any, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-[11px] text-zinc-300"
                >
                  <span className="text-violet-300">{s.agent}</span>
                  <span className="text-zinc-500">·</span>
                  <span className="text-zinc-400 truncate max-w-[280px]">
                    {s.task}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          {error}. Make sure the backend is running on :8000.
        </div>
      )}

      <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat
          icon={<Bot className="size-4" />}
          label="Agents"
          value={summary?.agents?.count ?? "—"}
          tone="violet"
        />
        <Stat
          icon={<Plug className="size-4" />}
          label="Connectors"
          value={`${summary?.connectors?.configured ?? 0}/${summary?.connectors?.count ?? "—"}`}
          tone="cyan"
        />
        <Stat
          icon={<Boxes className="size-4" />}
          label="MCPs"
          value={summary?.mcps?.count ?? "—"}
          tone="emerald"
        />
        <Stat
          icon={<Workflow className="size-4" />}
          label="Workflows"
          value={`${summary?.workflows?.enabled ?? 0}/${summary?.workflows?.count ?? "—"}`}
          tone="amber"
        />
        <Stat
          icon={<Activity className="size-4" />}
          label="Pending approvals"
          value={summary?.approvals?.pending ?? "—"}
          tone={summary?.approvals?.pending > 0 ? "red" : "zinc"}
        />
      </div>

      {summary?.ai_router && (
        <div className="mt-8 rounded-xl border border-white/10 bg-zinc-900/40 p-5">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
            AI router · provider chain
          </div>
          <div className="grid md:grid-cols-5 gap-2">
            {summary.ai_router.providers.map((p: any) => (
              <div
                key={p.name}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs",
                  p.available
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-200"
                    : "border-white/5 bg-white/[0.02] text-zinc-500",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{p.name}</span>
                  {p.is_local && (
                    <span className="text-[9px] uppercase tracking-widest text-zinc-500">
                      local
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-zinc-500 truncate">
                  {p.default_model}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone: "violet" | "cyan" | "emerald" | "amber" | "red" | "zinc";
}) {
  const toneClass = {
    violet: "text-violet-300",
    cyan: "text-cyan-300",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    red: "text-red-300",
    zinc: "text-zinc-300",
  }[tone];
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-4">
      <div className={cn("flex items-center gap-2 mb-2 text-xs", toneClass)}>
        {icon}
        <span className="uppercase tracking-widest text-[10px] text-zinc-500">
          {label}
        </span>
      </div>
      <div className={cn("text-2xl font-semibold", toneClass)}>{value}</div>
    </div>
  );
}
