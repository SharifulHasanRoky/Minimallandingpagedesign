import { useEffect, useState } from "react";
import { Plus, RefreshCw, Sparkles } from "lucide-react";
import { api } from "../lib/api";

export function MCPsView() {
  const [mcps, setMcps] = useState<any[]>([]);
  const [showGen, setShowGen] = useState(false);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tools, setTools] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setMcps(await api.listMcps());
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  async function generate() {
    if (!name.trim() || !purpose.trim()) return;
    setBusy(true);
    try {
      await api.generateMcp(
        name.trim(),
        purpose.trim(),
        tools
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      );
      setShowGen(false);
      setName("");
      setPurpose("");
      setTools("");
      await refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
            model context protocol
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">MCP servers</h1>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10"
          >
            <RefreshCw className="size-3.5" /> Reload
          </button>
          <button
            onClick={() => setShowGen((s) => !s)}
            className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-br from-violet-500 to-cyan-500 px-3 py-1.5 text-xs text-white"
          >
            <Sparkles className="size-3.5" /> Generate MCP
          </button>
        </div>
      </div>

      {showGen && (
        <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-5 mb-6">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
            describe what you need · the mcp_builder agent will scaffold it
          </div>
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="name (e.g. meta-ads-monitor)"
              className="w-full rounded-md bg-zinc-950/60 border border-white/10 px-3 py-2 text-sm outline-none focus:border-violet-500/30"
            />
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="purpose (e.g. Monitor Meta Ads ROAS and emit anomaly alerts)"
              className="w-full min-h-[80px] rounded-md bg-zinc-950/60 border border-white/10 px-3 py-2 text-sm outline-none focus:border-violet-500/30"
            />
            <input
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              placeholder="tools, comma-separated (e.g. fetch_campaigns, detect_anomaly, send_alert)"
              className="w-full rounded-md bg-zinc-950/60 border border-white/10 px-3 py-2 text-sm outline-none focus:border-violet-500/30"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowGen(false)}
                className="rounded-md bg-white/5 px-3 py-1.5 text-xs text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={generate}
                disabled={busy || !name.trim() || !purpose.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-br from-violet-500 to-cyan-500 px-4 py-1.5 text-xs text-white disabled:opacity-50"
              >
                <Plus className="size-3.5" /> Scaffold
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300 mb-6">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {mcps.map((m) => (
          <div
            key={m.name}
            className="rounded-xl border border-white/5 bg-zinc-900/40 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-zinc-100">{m.name}</span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 px-1.5 py-0.5 rounded bg-white/5">
                {m.transport ?? "stdio"}
              </span>
              <span className="ml-auto text-[10px] uppercase tracking-widest text-emerald-300">
                {m.status}
              </span>
            </div>
            {m.description && (
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                {m.description}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {(m.tools || []).map((t: any) => (
                <span
                  key={t.name}
                  className="text-[11px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-200"
                  title={t.description}
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        ))}
        {mcps.length === 0 && (
          <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-8 text-sm text-zinc-500 text-center">
            No MCPs loaded. The two builtins should auto-load — if you don't see
            them, check the backend logs.
          </div>
        )}
      </div>
    </div>
  );
}
