import { useEffect, useState } from "react";
import { Check, ShieldAlert, X } from "lucide-react";
import { api } from "../lib/api";
import { useEventStream } from "../lib/events";
import { cn } from "../components/ui/utils";

export function ApprovalsView() {
  const [items, setItems] = useState<any[]>([]);
  const [auditEntries, setAuditEntries] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Re-render whenever a new approval event arrives.
  const { events } = useEventStream({ replay: 0, max: 50 });

  async function refresh() {
    try {
      setItems(await api.listApprovals());
      setAuditEntries((await api.audit(50)).entries);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  useEffect(() => {
    if (events.some((e) => e.kind.startsWith("approval"))) refresh();
  }, [events]);

  async function decide(id: string, approve: boolean) {
    try {
      await api.decideApproval(id, approve);
      await refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  const pending = items.filter((i) => i.status === "pending");
  const recent = items.filter((i) => i.status !== "pending").slice(-20).reverse();

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
          human-in-the-loop
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Approvals</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300 mb-6">
          {error}
        </div>
      )}

      <section className="mb-10">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
          pending · {pending.length}
        </div>
        {pending.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-8 text-sm text-zinc-500 text-center">
            Nothing waiting. Agents are free to proceed within their approved
            envelope.
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5"
              >
                <div className="flex items-start gap-3">
                  <ShieldAlert className="size-5 text-amber-300 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                      <span className="text-amber-300 font-medium">{a.actor}</span>
                      <span>·</span>
                      <span>{a.action}</span>
                      <span>·</span>
                      <span
                        className={cn(
                          "text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded",
                          a.effect_class === "spend_money"
                            ? "bg-red-500/15 text-red-300"
                            : "bg-amber-500/15 text-amber-300",
                        )}
                      >
                        {a.effect_class}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-100 leading-relaxed mb-3">
                      {a.summary}
                    </p>
                    {a.payload && Object.keys(a.payload).length > 0 && (
                      <pre className="text-[11px] text-zinc-400 bg-zinc-950/60 rounded p-2 max-h-32 overflow-auto border border-white/5">
                        {JSON.stringify(a.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => decide(a.id, true)}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-200 hover:bg-emerald-500/25"
                    >
                      <Check className="size-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => decide(a.id, false)}
                      className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/25"
                    >
                      <X className="size-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {recent.length > 0 && (
        <section className="mb-10">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
            recent decisions
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            {recent.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-md border border-white/5 bg-zinc-950/40 px-3 py-2"
              >
                <span
                  className={cn(
                    "shrink-0 w-20",
                    a.status === "approved"
                      ? "text-emerald-300"
                      : a.status === "rejected"
                      ? "text-red-300"
                      : "text-zinc-500",
                  )}
                >
                  {a.status}
                </span>
                <span className="text-zinc-400 shrink-0">{a.actor}</span>
                <span className="text-zinc-500 truncate flex-1">{a.summary}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
          audit log · last {auditEntries.length}
        </div>
        <div className="space-y-1.5 text-xs font-mono">
          {auditEntries.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 rounded-md border border-white/5 bg-zinc-950/40 px-3 py-2"
            >
              <span className="shrink-0 w-32 truncate text-zinc-400">
                {e.actor}
              </span>
              <span className="shrink-0 w-40 truncate text-violet-300">
                {e.action}
              </span>
              <span className="shrink-0 text-[10px] uppercase tracking-widest text-zinc-500">
                {e.effect_class}
              </span>
              <span
                className={cn(
                  "ml-auto shrink-0 size-1.5 rounded-full",
                  e.ok ? "bg-emerald-400" : "bg-red-400",
                )}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
