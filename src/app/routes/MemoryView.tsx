import { useEffect, useState } from "react";
import { Pin, Search } from "lucide-react";
import { api } from "../lib/api";
import { cn } from "../components/ui/utils";

export function MemoryView() {
  const [entries, setEntries] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<any[] | null>(null);
  const [kindFilter, setKindFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const res = await api.listMemory(kindFilter || undefined, 100);
      setEntries(res.entries);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    refresh();
  }, [kindFilter]);

  async function recall() {
    if (!q.trim()) {
      setHits(null);
      return;
    }
    try {
      const res = await api.recall(q.trim(), 12);
      setHits(res.hits);
    } catch (e: any) {
      setError(e.message);
    }
  }

  const kinds = Array.from(new Set(entries.map((e) => e.kind)));
  const visible = hits ?? entries;

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
          long-term memory
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Memory</h1>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && recall()}
            placeholder="Semantic search across everything I remember…"
            className="w-full rounded-md border border-white/10 bg-zinc-950/60 pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-violet-500/30"
          />
        </div>
        <button
          onClick={recall}
          className="rounded-md bg-violet-500/15 px-4 py-2 text-xs text-violet-200 hover:bg-violet-500/25"
        >
          Recall
        </button>
        {hits && (
          <button
            onClick={() => {
              setHits(null);
              setQ("");
            }}
            className="rounded-md bg-white/5 px-4 py-2 text-xs text-zinc-400 hover:bg-white/10"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs">
        <button
          onClick={() => setKindFilter(null)}
          className={cn(
            "px-2.5 py-1 rounded",
            kindFilter === null ? "bg-white/10 text-zinc-100" : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          all
        </button>
        {kinds.map((k) => (
          <button
            key={k}
            onClick={() => setKindFilter(k)}
            className={cn(
              "px-2.5 py-1 rounded",
              kindFilter === k ? "bg-white/10 text-zinc-100" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {k}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300 mb-6">
          {error}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-8 text-sm text-zinc-500 text-center">
          No memories yet. Have a chat from the dashboard — the orchestrator will
          curate facts here automatically.
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((e) => (
            <div
              key={e.id}
              className="rounded-lg border border-white/5 bg-zinc-900/40 p-4"
            >
              <div className="flex items-center gap-2 mb-1.5 text-[10px] uppercase tracking-widest text-zinc-500">
                <span className="text-violet-300">{e.kind}</span>
                {e.pinned && (
                  <span className="inline-flex items-center gap-0.5 text-amber-300">
                    <Pin className="size-3" /> pinned
                  </span>
                )}
                {e.score !== undefined && (
                  <span className="text-zinc-500">
                    · score {e.score.toFixed(2)}
                  </span>
                )}
                {e.source && (
                  <span className="text-zinc-500">· {e.source}</span>
                )}
              </div>
              <div className="text-sm text-zinc-200 leading-relaxed">{e.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
