// Thin fetch wrapper for the Coworker OS backend.
// Base URL is configurable via VITE_API_BASE; defaults to localhost:8000.

const BASE = (import.meta.env.VITE_API_BASE as string) || "http://localhost:8000";

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  base: BASE,

  // ── Health & summary ──────────────────────────────────────────────
  health: () => request<{ ok: boolean; version: string; subscribers: number }>("/api/health"),
  summary: () => request<any>("/api/system/summary"),
  routerStatus: () => request<any>("/api/system/router"),

  // ── Chat ──────────────────────────────────────────────────────────
  chat: (message: string, threadId?: string, preferLocal?: boolean) =>
    request<any>("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        thread_id: threadId,
        prefer_local: !!preferLocal,
      }),
    }),

  // ── Agents ────────────────────────────────────────────────────────
  listAgents: () => request<any[]>("/api/agents"),
  invokeAgent: (name: string, task: string, context: Record<string, unknown> = {}) =>
    request<any>(`/api/agents/${encodeURIComponent(name)}/invoke`, {
      method: "POST",
      body: JSON.stringify({ task, context }),
    }),

  // ── Memory ────────────────────────────────────────────────────────
  listMemory: (kind?: string, limit = 50) =>
    request<{ entries: any[] }>(
      `/api/memory?${new URLSearchParams({ ...(kind ? { kind } : {}), limit: String(limit) })}`,
    ),
  remember: (kind: string, text: string, metadata: Record<string, unknown> = {}) =>
    request<any>("/api/memory/remember", {
      method: "POST",
      body: JSON.stringify({ kind, text, metadata }),
    }),
  recall: (q: string, k = 8) =>
    request<{ query: string; hits: any[] }>(
      `/api/memory/recall?q=${encodeURIComponent(q)}&k=${k}`,
    ),

  // ── MCPs ──────────────────────────────────────────────────────────
  listMcps: () => request<any[]>("/api/mcps"),
  generateMcp: (name: string, purpose: string, tools: string[]) =>
    request<any>("/api/mcps/generate", {
      method: "POST",
      body: JSON.stringify({ name, purpose, tools }),
    }),
  reloadMcps: () => request<any>("/api/mcps/reload", { method: "POST" }),

  // ── Connectors ────────────────────────────────────────────────────
  listConnectors: () => request<any[]>("/api/connectors"),
  configureConnector: (name: string, credentials: Record<string, string>) =>
    request<any>(`/api/connectors/${encodeURIComponent(name)}/configure`, {
      method: "POST",
      body: JSON.stringify({ credentials }),
    }),
  connectorHealth: (name: string) =>
    request<any>(`/api/connectors/${encodeURIComponent(name)}/health`),

  // ── Workflows ─────────────────────────────────────────────────────
  listWorkflows: () => request<any[]>("/api/workflows"),
  workflowTemplates: () => request<any[]>("/api/workflows/templates"),
  upsertWorkflow: (spec: any) =>
    request<any>("/api/workflows", { method: "POST", body: JSON.stringify(spec) }),
  runWorkflow: (id: string, payload: Record<string, unknown> = {}) =>
    request<any>(`/api/workflows/${encodeURIComponent(id)}/run`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  simulateWorkflow: (id: string, payload: Record<string, unknown> = {}) =>
    request<any>(`/api/workflows/${encodeURIComponent(id)}/simulate`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ── Approvals ─────────────────────────────────────────────────────
  listApprovals: () => request<any[]>("/api/approvals"),
  decideApproval: (id: string, approve: boolean, reason?: string) =>
    request<any>(`/api/approvals/${encodeURIComponent(id)}/decide`, {
      method: "POST",
      body: JSON.stringify({ approve, reason }),
    }),
  halt: () => request<any>("/api/approvals/halt", { method: "POST" }),
  resume: () => request<any>("/api/approvals/resume", { method: "POST" }),
  audit: (limit = 100) => request<{ entries: any[] }>(`/api/approvals/audit?limit=${limit}`),

  // ── Events (history; SSE handled separately) ──────────────────────
  eventsHistory: (limit = 100) =>
    request<{ events: any[] }>(`/api/events/history?limit=${limit}`),
};

export type AgentDescriptor = {
  name: string;
  description: string;
  tags: string[];
  task_kind: string;
  complexity: string;
};

export type CoworkerEvent = {
  seq: number;
  kind: string;
  ts: number;
  source: string;
  payload: Record<string, any>;
};
