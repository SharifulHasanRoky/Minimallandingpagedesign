import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { Shell } from "./components/Shell";
import { Dashboard } from "./routes/Dashboard";
import { ThinkingFeed } from "./routes/ThinkingFeed";
import { AgentsView } from "./routes/AgentsView";
import { MemoryView } from "./routes/MemoryView";
import { MCPsView } from "./routes/MCPsView";
import { ConnectorsView } from "./routes/ConnectorsView";
import { WorkflowsView } from "./routes/WorkflowsView";
import { ApprovalsView } from "./routes/ApprovalsView";
import { api } from "./lib/api";
import { useEventStream } from "./lib/events";

export default function App() {
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [halted, setHalted] = useState(false);
  const { connected, events } = useEventStream({ replay: 0, max: 10 });

  async function refresh() {
    try {
      const s = await api.summary();
      setPendingApprovals(s.approvals.pending ?? 0);
      setHalted(!!s.approvals.halted);
    } catch {
      /* backend not up yet */
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, []);

  // Light reactivity: refresh on approval events.
  useEffect(() => {
    if (events.some((e) => e.kind.startsWith("approval"))) refresh();
  }, [events]);

  async function onHalt() {
    try {
      await api.halt();
      setHalted(true);
    } catch {
      /* ignore */
    }
  }
  async function onResume() {
    try {
      await api.resume();
      setHalted(false);
    } catch {
      /* ignore */
    }
  }

  return (
    <BrowserRouter>
      <Shell
        pendingApprovals={pendingApprovals}
        halted={halted}
        onHalt={onHalt}
        onResume={onResume}
        connected={connected}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/feed" element={<ThinkingFeed />} />
          <Route path="/agents" element={<AgentsView />} />
          <Route path="/memory" element={<MemoryView />} />
          <Route path="/mcps" element={<MCPsView />} />
          <Route path="/connectors" element={<ConnectorsView />} />
          <Route path="/workflows" element={<WorkflowsView />} />
          <Route path="/approvals" element={<ApprovalsView />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
