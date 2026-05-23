import { useEffect, useMemo, useState } from "react";
import { Check, KeyRound, X } from "lucide-react";
import { api } from "../lib/api";
import { cn } from "../components/ui/utils";

export function ConnectorsView() {
  const [items, setItems] = useState<any[]>([]);
  const [active, setActive] = useState<any | null>(null);
  const [creds, setCreds] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    try {
      setItems(await api.listConnectors());
    } catch (e) {
      // ignore
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  const grouped = useMemo(() => {
    const out: Record<string, any[]> = {};
    items.forEach((c) => {
      out[c.category] ||= [];
      out[c.category].push(c);
    });
    return out;
  }, [items]);

  async function configure() {
    if (!active) return;
    setBusy(true);
    setMsg(null);
    try {
      await api.configureConnector(active.name, creds);
      setMsg("Saved.");
      await refresh();
      setTimeout(() => setActive(null), 800);
    } catch (e: any) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
          integrations
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Connectors · {items.length}
        </h1>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([cat, list]) => (
          <div key={cat}>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
              {cat.replace(/_/g, " ")}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {list.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setActive(c);
                    setCreds({});
                    setMsg(null);
                  }}
                  className={cn(
                    "text-left rounded-xl border bg-zinc-900/40 p-4 transition-colors",
                    "border-white/5 hover:border-white/15",
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-zinc-100">
                      {c.name}
                    </span>
                    <span
                      className={cn(
                        "ml-auto text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded",
                        c.status === "configured"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : c.status === "stub"
                          ? "bg-zinc-800 text-zinc-500"
                          : "bg-amber-500/15 text-amber-300",
                      )}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">{c.description}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-zinc-950 p-6">
            <div className="flex items-center gap-2 mb-1">
              <KeyRound className="size-4 text-violet-300" />
              <h3 className="font-semibold text-zinc-100">
                Configure {active.name}
              </h3>
              <button
                onClick={() => setActive(null)}
                className="ml-auto text-zinc-500 hover:text-zinc-200"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-4">{active.description}</p>
            {active.docs_url && (
              <a
                href={active.docs_url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-violet-300 hover:underline mb-4 inline-block"
              >
                ↗ docs
              </a>
            )}
            {active.required_credentials.length === 0 ? (
              <div className="text-xs text-zinc-500 italic">
                No credentials required (uses local resources).
              </div>
            ) : (
              <div className="space-y-3">
                {active.required_credentials.map((field: string) => (
                  <div key={field}>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                      {field}
                    </div>
                    <input
                      type="password"
                      value={creds[field] || ""}
                      onChange={(e) =>
                        setCreds({ ...creds, [field]: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full rounded-md bg-zinc-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-violet-500/30"
                    />
                  </div>
                ))}
              </div>
            )}
            {msg && (
              <div className="mt-3 text-xs text-zinc-300">
                {msg.startsWith("Error") ? (
                  <span className="text-red-300">{msg}</span>
                ) : (
                  <span className="text-emerald-300">{msg}</span>
                )}
              </div>
            )}
            {active.required_credentials.length > 0 && (
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => setActive(null)}
                  className="rounded-md bg-white/5 px-3 py-1.5 text-xs text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  onClick={configure}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-br from-violet-500 to-cyan-500 px-4 py-1.5 text-xs text-white disabled:opacity-50"
                >
                  <Check className="size-3.5" /> Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
