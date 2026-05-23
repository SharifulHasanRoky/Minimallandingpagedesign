# Coworker OS — Architecture

A 100% free, self-hosted, AI-native Personal Coworker Operating System.

## North-Star Principles

1. **Free-first.** Every subsystem must have a $0 path. Paid integrations are *opt-in*, never required.
2. **Local-first.** Anything that can run on the user's machine, does. The cloud is a fallback, not a dependency.
3. **Modular.** Every capability (agent, MCP, connector, workflow) is a hot-swappable plugin.
4. **AI-routed.** A single router decides which model handles which task. The system itself optimizes cost.
5. **Approval-gated.** The AI never spends money, sends messages, or mutates external systems without explicit human approval.
6. **Auditable.** Every agent decision and external action is logged with a rollback handle.

## High-Level Topology

```
                     ┌────────────────────────────────────────────┐
                     │              FRONTEND (Vite/React)         │
                     │   Command Center · Thinking Feed · Graph   │
                     │   Memory Viewer · MCP Mgr · Approvals UI   │
                     └────────────────────┬───────────────────────┘
                                          │ HTTP + SSE (/events)
                     ┌────────────────────┴───────────────────────┐
                     │            BACKEND (FastAPI · Python)       │
                     │                                              │
                     │   ┌──────────────────────────────────────┐  │
                     │   │      Orchestrator Agent              │  │
                     │   │  plans → routes → approves → executes│  │
                     │   └─────┬─────────────────────────┬──────┘  │
                     │         │                         │         │
                     │   ┌─────▼─────┐  ┌─────────┐  ┌──▼─────┐    │
                     │   │ AI Router │  │ Memory  │  │ Agents │    │
                     │   │ (Gemini,  │  │ SQLite +│  │ 18 ×   │    │
                     │   │ OpenRouter│  │ Chroma  │  │ skills │    │
                     │   │ HF, Olla- │  └────┬────┘  └──┬─────┘    │
                     │   │ ma local) │       │          │          │
                     │   └─────┬─────┘  ┌────▼────┐  ┌──▼─────┐    │
                     │         │        │  MCPs   │  │Connect-│    │
                     │         │        │ registry│  │ ors    │    │
                     │         │        └────┬────┘  └──┬─────┘    │
                     │   ┌─────▼─────────────▼──────────▼─────┐    │
                     │   │  Workflow Engine + Approval Bus    │    │
                     │   │  Audit Log · Event Bus (SSE)       │    │
                     │   └────────────────────────────────────┘    │
                     └─────────────────────┬────────────────────────┘
                                           │
                              ┌────────────┴────────────┐
                              │                         │
                       ┌──────▼──────┐         ┌────────▼────────┐
                       │ Postgres /  │         │  Ollama (local) │
                       │  SQLite     │         │  Llama, Qwen,   │
                       │  Chroma     │         │  Mistral, Phi…  │
                       │  Redis      │         └─────────────────┘
                       └─────────────┘
```

## Folder Structure

```
.
├── ARCHITECTURE.md                ← this file
├── README.md                       ← free-only setup guide
├── docker-compose.yml              ← one-command self-host
├── .env.example                    ← all free-tier API keys (optional)
│
├── backend/                        ← FastAPI Python service
│   ├── pyproject.toml
│   ├── Dockerfile
│   ├── app/
│   │   ├── main.py                 ← FastAPI entrypoint
│   │   ├── settings.py             ← env config
│   │   ├── logging.py
│   │   ├── core/
│   │   │   ├── event_bus.py        ← SSE pub/sub (live thinking feed)
│   │   │   ├── approvals.py        ← human-in-the-loop gate
│   │   │   ├── audit.py            ← every action recorded + rollback
│   │   │   └── secrets.py          ← encrypted secret store (Fernet)
│   │   ├── ai/
│   │   │   ├── router.py           ← chooses provider per task
│   │   │   ├── budget.py           ← token / RPM tracking
│   │   │   └── providers/
│   │   │       ├── base.py
│   │   │       ├── gemini.py       ← Google AI Studio free tier
│   │   │       ├── openrouter.py   ← OpenRouter :free models
│   │   │       ├── deepseek.py     ← DeepSeek free
│   │   │       ├── huggingface.py  ← HF Inference free
│   │   │       └── ollama.py       ← local fallback (always free)
│   │   ├── memory/
│   │   │   ├── store.py            ← SQLite structured memory
│   │   │   ├── vector.py           ← Chroma vector recall
│   │   │   └── rag.py              ← retrieval pipeline
│   │   ├── agents/
│   │   │   ├── base.py             ← Agent abstract class
│   │   │   ├── orchestrator.py     ← plans + dispatches
│   │   │   ├── research.py
│   │   │   ├── coding.py
│   │   │   ├── automation.py
│   │   │   ├── marketing.py
│   │   │   ├── analytics.py
│   │   │   ├── browser.py
│   │   │   ├── mcp_builder.py
│   │   │   ├── workflow.py
│   │   │   ├── memory_agent.py
│   │   │   ├── strategy.py
│   │   │   ├── reporting.py
│   │   │   ├── voice.py
│   │   │   ├── content.py
│   │   │   ├── seo.py
│   │   │   ├── social.py
│   │   │   ├── forecasting.py
│   │   │   ├── data.py
│   │   │   └── local_ai.py
│   │   ├── mcps/
│   │   │   ├── registry.py         ← loads, lists, manages MCP servers
│   │   │   ├── generator.py        ← AI-generated MCP scaffolds
│   │   │   └── builtin/            ← shipped reference MCPs
│   │   ├── connectors/
│   │   │   ├── registry.py         ← all integrations
│   │   │   ├── base.py
│   │   │   └── catalog.py          ← Google Ads, Meta, GA4, Notion …
│   │   ├── workflows/
│   │   │   ├── engine.py           ← run + simulate + debug
│   │   │   ├── triggers.py         ← KPI drop, anomaly, schedule, webhook
│   │   │   └── library/
│   │   ├── routes/
│   │   │   ├── chat.py
│   │   │   ├── agents.py
│   │   │   ├── memory.py
│   │   │   ├── mcps.py
│   │   │   ├── connectors.py
│   │   │   ├── workflows.py
│   │   │   ├── approvals.py
│   │   │   └── events.py           ← SSE
│   │   └── schemas.py
│   └── data/                       ← gitignored runtime data (sqlite, chroma)
│
├── src/                            ← existing Vite frontend (kept in place)
│   ├── main.tsx
│   ├── app/
│   │   ├── App.tsx                 ← rebuilt as Command Center shell
│   │   ├── routes/                 ← page-level views
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ThinkingFeed.tsx
│   │   │   ├── AgentsView.tsx
│   │   │   ├── MemoryView.tsx
│   │   │   ├── MCPsView.tsx
│   │   │   ├── ConnectorsView.tsx
│   │   │   ├── WorkflowsView.tsx
│   │   │   └── ApprovalsView.tsx
│   │   ├── lib/
│   │   │   ├── api.ts              ← fetch wrappers for backend
│   │   │   └── events.ts           ← SSE client
│   │   └── components/
│   │       ├── CommandBar.tsx
│   │       ├── Shell.tsx           ← sidebar + topbar layout
│   │       └── ui/                 ← existing shadcn (kept)
│   └── styles/                     ← existing Tailwind v4 setup (kept)
│
└── .kiro/
    └── steering/                   ← project-specific rules for future Kiro sessions
```

## Subsystem Responsibilities

### AI Router (`backend/app/ai/router.py`)
Given a task `{kind, complexity, latency_ms_budget}`, returns a provider+model.
Default policy:
- `kind=embed` → local sentence-transformers (free, offline)
- `kind=chat`, `complexity=low` → Ollama `qwen2.5:3b` (local) → Gemini Flash → OpenRouter free
- `kind=reason`, `complexity=high` → Gemini 2.x Pro free → DeepSeek free → Ollama `qwen2.5:14b` → OpenRouter `deepseek-r1:free`
- `kind=code` → DeepSeek-Coder free → Ollama `qwen2.5-coder` → Gemini
On 429/quota error, the router transparently fails over and updates the budget tracker.

### Memory
- **SQLite** stores structured memory: goals, projects, preferences, decisions, conversation summaries, recurring tasks.
- **Chroma** stores embeddings for semantic recall (RAG).
- The `memory_agent` decides what to remember (write-side) and what to retrieve (read-side).

### Agents
All inherit from `Agent` with `name`, `description`, `tools`, `run(task, ctx)`. The orchestrator builds a plan (a small DAG), executes it concurrently when possible, streams thinking events to the UI via the event bus, and asks for approval before any external mutation.

### MCPs
A YAML/JSON manifest describes each MCP server. The registry loads them at startup, exposes their tools to agents, and (via `mcp_builder` agent) can scaffold a new server when a needed capability is missing.

### Connectors
Each connector implements `auth()`, `health()`, and a small typed surface. Credentials live in the encrypted secret store. Connectors that we cannot ship a real integration for in skeleton form expose a clearly-marked `STUB` interface so the rest of the system still works end-to-end.

### Workflows + Approvals + Audit
Workflows are step DAGs with typed triggers. Each step has an `effect_class`: `read | compute | mutate_internal | mutate_external | spend_money`. Anything ≥ `mutate_external` is queued for approval. Every executed step writes an audit row with inputs, outputs, and a rollback hint.

### Event Bus / Live Thinking Feed
A simple in-process pub/sub backed by `asyncio.Queue`s, exposed at `/events` as Server-Sent Events. Agents emit `agent.thought`, `agent.tool_call`, `agent.result`, `approval.requested`, `workflow.step.*` etc. The UI subscribes once and renders a real-time feed.

## Free-Tier Resource Map

| Capability         | Free option (default)       | Free fallback              | Always-free local              |
|--------------------|------------------------------|----------------------------|---------------------------------|
| Reasoning LLM      | Gemini 2.x (AI Studio)       | OpenRouter `:free`         | Ollama Qwen / Llama / Mistral   |
| Code LLM           | DeepSeek free                | OpenRouter `deepseek:free` | Ollama `qwen2.5-coder`          |
| Embeddings         | HuggingFace Inference        | —                          | `sentence-transformers` local   |
| Vector DB          | —                            | —                          | Chroma (embedded)               |
| SQL DB             | Supabase free                | Neon free                  | SQLite / Postgres in Docker     |
| Cache / Queue      | Upstash free                 | —                          | Redis in Docker                 |
| Hosting            | Cloudflare Pages / Workers   | Fly.io free / Railway trial| Docker on your machine          |
| Automation runtime | —                            | —                          | n8n self-hosted (Docker)        |
| Browser control    | —                            | —                          | Playwright local                |
| CI/CD              | GitHub Actions free minutes  | —                          | —                               |

## Security Posture

- All third-party credentials encrypted at rest with a Fernet key derived from `COWORKER_MASTER_KEY` (env).
- Approval-required for: external API mutations, file deletions, git pushes to non-feature branches, any spend.
- Emergency stop: `POST /approvals/halt` immediately kills all running agents and freezes the workflow engine.
- Rollback: every audited action records a compensating action when one is possible.
