import { FormEvent, useState } from "react";
import { Cpu, Globe, Loader2, Send } from "lucide-react";
import { api } from "../lib/api";
import { cn } from "./ui/utils";

export function CommandBar({
  onReply,
}: {
  onReply: (resp: {
    reply: string;
    used_provider?: string | null;
    used_model?: string | null;
    plan?: any[];
  }) => void;
}) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [preferLocal, setPreferLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.chat(value.trim(), undefined, preferLocal);
      onReply(res);
      setValue("");
    } catch (err: any) {
      setError(err?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div
        className={cn(
          "group relative flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl px-4 py-3",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_80px_-30px_rgba(139,92,246,0.4)]",
          "focus-within:border-violet-500/30 transition-colors",
        )}
      >
        <button
          type="button"
          onClick={() => setPreferLocal((v) => !v)}
          title={preferLocal ? "Local-first (Ollama)" : "Cloud-allowed"}
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs",
            preferLocal
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-white/5 text-zinc-400 hover:text-zinc-200",
          )}
        >
          {preferLocal ? <Cpu className="size-3.5" /> : <Globe className="size-3.5" />}
          {preferLocal ? "Local" : "Cloud OK"}
        </button>

        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask anything · plan a task · build a workflow · spin up an MCP…"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-500"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !value.trim()}
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium",
            "bg-gradient-to-br from-violet-500 to-cyan-500 text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
          Send
        </button>
      </div>
      {error && (
        <div className="text-xs text-red-400 px-1">
          {error.includes("Failed to fetch") || error.includes("NetworkError")
            ? "Backend unreachable. Start it with `cd backend && uvicorn app.main:app --reload`."
            : error}
        </div>
      )}
    </form>
  );
}
