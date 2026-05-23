// SSE client + React hook for the live thinking feed.
// EventSource handles auto-reconnect; we just maintain a bounded buffer.

import { useEffect, useRef, useState } from "react";
import type { CoworkerEvent } from "./api";

const BASE = (import.meta.env.VITE_API_BASE as string) || "http://localhost:8000";

export function useEventStream({
  replay = 25,
  max = 200,
}: { replay?: number; max?: number } = {}) {
  const [events, setEvents] = useState<CoworkerEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const url = `${BASE}/api/events/stream?replay=${replay}`;
    const es = new EventSource(url);
    sourceRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    // Backend uses named events (one per kind). Capture them all by name.
    const handler = (e: MessageEvent) => {
      try {
        const ev = JSON.parse(e.data) as CoworkerEvent;
        setEvents((prev) => {
          const next = [...prev, ev];
          if (next.length > max) next.splice(0, next.length - max);
          return next;
        });
      } catch {
        // ignore parse errors
      }
    };

    const kinds = [
      "agent.thought",
      "agent.tool_call",
      "agent.tool_result",
      "agent.result",
      "agent.error",
      "approval.requested",
      "approval.resolved",
      "workflow.started",
      "workflow.step",
      "workflow.completed",
      "router.selected",
      "router.fallback",
      "memory.write",
      "memory.recall",
      "system.info",
    ];
    kinds.forEach((k) => es.addEventListener(k, handler as EventListener));

    return () => {
      kinds.forEach((k) => es.removeEventListener(k, handler as EventListener));
      es.close();
      sourceRef.current = null;
    };
  }, [replay, max]);

  return { events, connected };
}

export function eventColor(kind: string): string {
  if (kind.startsWith("agent.error")) return "text-red-400";
  if (kind.startsWith("approval")) return "text-amber-400";
  if (kind.startsWith("workflow")) return "text-cyan-400";
  if (kind.startsWith("router")) return "text-violet-400";
  if (kind.startsWith("memory")) return "text-emerald-400";
  if (kind.startsWith("agent.thought")) return "text-zinc-300";
  if (kind.startsWith("agent.tool")) return "text-sky-400";
  if (kind.startsWith("agent.result")) return "text-green-400";
  return "text-zinc-400";
}
