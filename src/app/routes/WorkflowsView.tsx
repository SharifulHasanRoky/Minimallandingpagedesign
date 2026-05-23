import { useEffect, useState } from "react";
import { Eye, Play, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import { cn } from "../components/ui/utils";

export function WorkflowsView() {
  const [items, setItems] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [output, setOutput] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setItems(await api.listWorkflows());
      setTemplates(await api.workflowTemplates());
    } catch (e: any) {
      setError(e.message);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  async function clone(t: any) {
    try {
      await api.upsertWorkflow(t);
      await refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function run(id: string) {
    setOutput({ pending: id });
    try {
      const r = await api.runWorkflow(id);
      setOutput({ id, result: r });
    } catch (e: any) {
      setOutput({ id, error: e.message });
    }
  }

  async function simulate(id: string) {
    setOutput({ pending: id });
    try {
      const r = await api.simulateWorkflow(id);
      setOutput({ id, result: r, simulate: true });
    } catch (e: any) {
      setOutput({ id, error: e.message });
    }
  }

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
          automation engine
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Workflows</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300 mb-6">
          {error}
        </div>
      )}

      {items.length === 0 && (
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-6 mb-6">
          <div className="text-sm text-zinc-300 mb-3">
            No workflows yet. Start from a template:
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {templates.map((t) => (
              <div
                key={t.name}
                className="rounded-lg border border-white/5 bg-zinc-950/40 p-4"
              >
                <div className="font-medium text-sm text-zinc-100 mb-1">
                  {t.name}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  {t.description}
                </p>
                <button
                  onClick={() => clone(t)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-violet-500/15 px-3 py-1.5 text-xs text-violet-200"
                >
                  <Sparkles className="size-3.5" /> Use this template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map((w) => (
          <div
            key={w.id}
            className="rounded-xl border border-white/5 bg-zinc-900/40 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-zinc-100">{w.name}</span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 px-1.5 py-0.5 rounded bg-white/5">
                {w.trigger?.kind || "manual"}
              </span>
              <span
                className={cn(
                  "text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded",
                  w.enabled ? "bg-emerald-500/15 text-emerald-300" : "bg-zinc-800 text-zinc-500",
                )}
              >
                {w.enabled ? "enabled" : "disabled"}
              </span>
              <div className="ml-auto flex gap-1">
                <button
                  onClick={() => simulate(w.id)}
                  className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] text-zinc-300"
                >
                  <Eye className="size-3" /> Simulate
                </button>
                <button
                  onClick={() => run(w.id)}
                  className="inline-flex items-center gap-1 rounded-md bg-gradient-to-br from-violet-500 to-cyan-500 px-2 py-1 text-[11px] text-white"
                >
                  <Play className="size-3" /> Run
                </button>
              </div>
            </div>
            <div className="text-xs text-zinc-400 mb-3">{w.description}</div>
            <div className="flex flex-wrap items-center gap-2">
              {(w.steps || []).map((s: any, idx: number, arr: any[]) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[11px] px-2 py-1 rounded border",
                      s.effect_class === "spend_money"
                        ? "border-red-500/30 bg-red-500/10 text-red-200"
                        : s.effect_class === "mutate_external"
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                        : s.effect_class === "mutate_internal"
                        ? "border-violet-500/30 bg-violet-500/10 text-violet-200"
                        : "border-white/10 bg-white/5 text-zinc-300",
                    )}
                  >
                    {s.label || s.id}
                  </span>
                  {idx < arr.length - 1 && (
                    <span className="text-zinc-700 text-xs">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {output && (
        <pre className="mt-6 max-h-96 overflow-auto rounded-md bg-zinc-950/60 border border-white/5 p-3 text-xs text-zinc-300">
          {JSON.stringify(output, null, 2)}
        </pre>
      )}
    </div>
  );
}
