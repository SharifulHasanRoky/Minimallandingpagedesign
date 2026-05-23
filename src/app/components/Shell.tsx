import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Bot,
  Boxes,
  GitBranch,
  Home,
  Plug,
  Power,
  Workflow,
} from "lucide-react";
import { cn } from "./ui/utils";

type NavItem = {
  to: string;
  icon: ReactNode;
  label: string;
};

const NAV: NavItem[] = [
  { to: "/", icon: <Home className="size-4" />, label: "Dashboard" },
  { to: "/feed", icon: <Activity className="size-4" />, label: "Live Thinking" },
  { to: "/agents", icon: <Bot className="size-4" />, label: "Agents" },
  { to: "/memory", icon: <BookOpen className="size-4" />, label: "Memory" },
  { to: "/mcps", icon: <Boxes className="size-4" />, label: "MCPs" },
  { to: "/connectors", icon: <Plug className="size-4" />, label: "Connectors" },
  { to: "/workflows", icon: <Workflow className="size-4" />, label: "Workflows" },
  { to: "/approvals", icon: <AlertTriangle className="size-4" />, label: "Approvals" },
];

export function Shell({
  children,
  pendingApprovals,
  halted,
  onHalt,
  onResume,
  connected,
}: {
  children: ReactNode;
  pendingApprovals: number;
  halted: boolean;
  onHalt: () => void;
  onResume: () => void;
  connected: boolean;
}) {
  const loc = useLocation();
  return (
    <div className="dark min-h-screen bg-background text-foreground antialiased">
      {/* ambient glow background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 size-[40rem] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 size-[40rem] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="grid min-h-screen grid-cols-[240px_1fr]">
        {/* ── Sidebar ────────────────────────────────────────────── */}
        <aside className="border-r border-white/5 bg-zinc-950/60 backdrop-blur-xl">
          <div className="flex h-14 items-center gap-2 px-5 border-b border-white/5">
            <div className="size-7 rounded-md bg-gradient-to-br from-violet-500 to-cyan-500 grid place-items-center">
              <GitBranch className="size-4 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Coworker OS</div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                free · self-hosted · ai-native
              </div>
            </div>
          </div>
          <nav className="p-3 space-y-1">
            {NAV.map((n) => {
              const active = loc.pathname === n.to;
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
                    active && "bg-white/10 text-zinc-50",
                  )}
                >
                  {n.icon}
                  <span>{n.label}</span>
                  {n.to === "/approvals" && pendingApprovals > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center rounded-full bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5">
                      {pendingApprovals}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="px-3 mt-6">
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-zinc-400">
              <div className="flex items-center justify-between mb-2">
                <span className="uppercase tracking-widest text-[10px] text-zinc-500">
                  status
                </span>
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    connected ? "bg-emerald-400" : "bg-zinc-600",
                  )}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Event stream</span>
                <span className={connected ? "text-emerald-400" : "text-zinc-500"}>
                  {connected ? "live" : "offline"}
                </span>
              </div>
              <button
                onClick={halted ? onResume : onHalt}
                className={cn(
                  "mt-3 w-full inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                  halted
                    ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                    : "bg-red-500/10 text-red-300 hover:bg-red-500/20",
                )}
              >
                <Power className="size-3.5" />
                {halted ? "Resume agents" : "Emergency stop"}
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────── */}
        <main className="min-h-screen overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
