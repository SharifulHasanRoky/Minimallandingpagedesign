# Coworker OS

> A **free, self-hosted, AI-native Personal Coworker Operating System** —
> orchestrator + 18 specialist agents, a free-tier AI router, MCP registry,
> connector ecosystem, automation engine and a futuristic dark-mode
> command center. Designed to run on your machine with **zero spend**.

```
        ┌──────────────── Command Center (Vite + React + Tailwind) ────────────────┐
        │  Dashboard · Live Thinking Feed · Agents · Memory · MCPs · Connectors    │
        │  Workflows · Approvals · Emergency Stop                                  │
        └────────────────────────────────┬─────────────────────────────────────────┘
                                         │ HTTP + SSE
        ┌────────────────────────────────▼──────────── FastAPI Backend ───────────┐
        │                                                                          │
        │   Orchestrator → plan → AI Router → 18 Specialists → Approval Gate →    │
        │   Audit Log → Memory (SQLite + Chroma) → MCPs → Connectors → Workflows  │
        │                                                                          │
        └──────────────────────────────────────────────────────────────────────────┘
```

This repo ships a **complete, runnable skeleton** of every subsystem
described above. Every module has a real interface, a real implementation
where the work fits in skeleton form, and a clearly-marked stub where the
full integration is bigger than this initial PR.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full design.

---

## Why "free"?

The system is engineered around a **free-first AI router**:

| Tier | Provider | Notes |
|---|---|---|
| Always free, always local | **Ollama** (Qwen / Llama / Mistral / DeepSeek-Coder) | Default fallback. Runs offline. |
| Free cloud (default) | **Google Gemini** (AI Studio key) | Free tier, generous limits. |
| Free cloud | **OpenRouter `:free` models** (DeepSeek-R1, Llama, etc.) | Free models exposed via OpenRouter. |
| Free credits | **DeepSeek** | Generous initial credits + cheap thereafter. |
| Free | **HuggingFace Inference Router** | Free hosted models. |

The router automatically:
- picks the cheapest / fastest free option per task type (`chat`, `reason`, `code`),
- fails over on `429` or quota errors with exponential cooldown,
- enforces **soft daily caps** so you never accidentally burn a free tier,
- can be flipped to **local-only** with one click in the UI.

You can run with **zero API keys** — everything routes to local Ollama.

---

## Quick start

### 1) One-command Docker (recommended)

```bash
git clone https://github.com/SharifulHasanRoky/Minimallandingpagedesign.git coworker-os
cd coworker-os
cp .env.example .env             # optional: drop in any free-tier keys you have
docker compose up -d             # backend + frontend + Postgres + Redis + Chroma
```

To also include local LLMs (recommended if you have ≥ 8 GB RAM):

```bash
docker compose --profile ollama up -d
docker exec -it coworker-ollama ollama pull qwen2.5:3b
docker exec -it coworker-ollama ollama pull qwen2.5-coder:7b
```

Open the command center at **http://localhost:5173**. The backend is at
**http://localhost:8000** (Swagger UI: `/docs`).

### 2) Local dev (no Docker)

Backend:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload --port 8000
```

Frontend (in a second terminal):

```bash
pnpm install
pnpm run dev
```

Optionally install Ollama natively from <https://ollama.com> and pull a small
model: `ollama pull qwen2.5:3b`.

---

## What's actually working today

| Subsystem | Status | Notes |
|---|---|---|
| FastAPI backend, all routes, OpenAPI docs | **working** | `/api/health`, `/api/chat`, `/api/agents`, `/api/memory`, `/api/mcps`, `/api/connectors`, `/api/workflows`, `/api/approvals`, `/api/events`, `/api/system` |
| AI Router with 5 providers + auto-failover | **working** | Gemini, OpenRouter, DeepSeek, HuggingFace, Ollama. Budget tracker enforces caps. |
| Orchestrator + 18 specialist agents | **working** | Plans → dispatches → merges. Runs end-to-end as soon as any one provider is reachable. |
| Memory (SQLite + Chroma + RAG) | **working** | Auto-falls-back to a hash-based embedder if `sentence-transformers` isn't installed yet. |
| Approval gate + audit log + emergency halt | **working** | Effect-class taxonomy: `read / compute / mutate_internal / mutate_external / spend_money`. |
| MCP registry + AI scaffolder | **working** | Loads YAML manifests, generates new MCP scaffolds via the `mcp_builder` agent. |
| Connector registry (29 integrations) | **registered as stubs** | Encrypted credential store works. Each connector ships as a stub; replace `health()` and add actions when you flesh one out. |
| Workflow engine + triggers + simulator | **working** | Topological execution, schedule trigger, simulate/dry-run, approval-gated mutations. |
| Live thinking feed (SSE) | **working** | Every agent thought, tool call, router decision and approval streams to the UI. |
| Command Center UI (8 views) | **working** | Dashboard, live feed, agents, memory, MCPs, connectors, workflows, approvals. |
| Self-host via `docker compose up` | **working** | Includes opt-in Ollama profile. |

> **Stub vs working** — every "stub" has the *same shape* as the eventual
> real implementation. Replacing it with a working integration is a local
> change inside one file; nothing else in the system has to move.

---

## Frontend tour

- **/** — Dashboard. The command bar is the orchestrator. Toggle "Local" to force Ollama.
- **/feed** — Live thinking feed. SSE stream of every event, color-coded by kind.
- **/agents** — All 18 specialists (plus the orchestrator). Click one to invoke directly.
- **/memory** — Long-term memory. Semantic recall via `/api/memory/recall`.
- **/mcps** — MCP registry. "Generate MCP" asks the `mcp_builder` agent to scaffold a new server from a one-line description.
- **/connectors** — 29 integrations grouped by category. Click any to encrypt-and-store credentials.
- **/workflows** — Visual list, simulate/run, template clone.
- **/approvals** — Anything risky waits here. Approve / reject / emergency-halt.

---

## Configuration

Everything is `COWORKER_*` env vars. `.env.example` documents them all. Highlights:

```env
# Free cloud providers - all OPTIONAL
COWORKER_GEMINI_API_KEY=...           # https://aistudio.google.com/apikey
COWORKER_OPENROUTER_API_KEY=...
COWORKER_DEEPSEEK_API_KEY=...
COWORKER_HUGGINGFACE_API_KEY=...

# Local Ollama
COWORKER_OLLAMA_BASE_URL=http://localhost:11434
COWORKER_OLLAMA_DEFAULT_CHAT_MODEL=qwen2.5:3b

# Soft caps so you never burn a free tier
COWORKER_DAILY_CLOUD_TOKEN_CAP=200000
COWORKER_DAILY_CLOUD_REQUEST_CAP=1000

# Approval policy - external mutations + spend ALWAYS require human click
COWORKER_AUTO_APPROVE_READ_ONLY=true
COWORKER_AUTO_APPROVE_INTERNAL_MUTATIONS=false
COWORKER_AUTO_APPROVE_EXTERNAL_MUTATIONS=false
COWORKER_AUTO_APPROVE_SPEND=false
```

Connector credentials are stored encrypted at rest with a Fernet key. The
key auto-generates on first boot and lives at `backend/data/.master_key`
(chmod 600). Override with `COWORKER_MASTER_KEY` to use your own.

---

## Adding things

### A new agent

```python
# backend/app/agents/specialists.py
MyAgent = _make(
    name="my_agent",
    description="What it does in one line.",
    tags={"tag1", "tag2"},
    task_kind="reason",
    system_prompt="You are MyAgent. Always reply in this format…",
)
SPECIALISTS.append(MyAgent)
```

### A new connector

```python
# backend/app/connectors/catalog.py
MyConnector = _make(
    name="my_service",
    description="...",
    category="productivity",
    required_credentials=["api_key"],
)
CATALOG.append(MyConnector)
```

To make it real, subclass `Connector` instead and override `health()` plus
add an `actions` module the workflow engine can call.

### A new MCP

Drop a YAML manifest in `backend/app/mcps/builtin/` (shipped) or
`backend/data/mcps/` (user). Or use the **Generate MCP** button in the UI
and let the `mcp_builder` agent design one for you.

### A new workflow

Either click "Use this template" on the Workflows page or POST to
`/api/workflows`:

```json
{
  "name": "My workflow",
  "trigger": {"kind": "schedule", "interval_seconds": 3600},
  "steps": [
    {"id": "fetch", "kind": "connector", "effect_class": "read",
     "inputs": {"connector": "ga4", "action": "run_report"}},
    {"id": "analyse", "kind": "agent", "needs": ["fetch"],
     "effect_class": "compute",
     "inputs": {"agent": "analytics", "task": "Summarise"}}
  ]
}
```

---

## Safety model

Every external action is classified by `effect_class`:

| Class | Auto-approved by default? |
|---|---|
| `read` | yes |
| `compute` | yes |
| `mutate_internal` | no |
| `mutate_external` | **no — requires you to click Approve** |
| `spend_money` | **no — requires you to click Approve** |

Every action lands in the SQLite audit log with inputs, outputs, and a
rollback hint. The sidebar **Emergency Stop** button immediately halts all
agents and freezes the workflow engine.

---

## Repository layout

```
.
├── ARCHITECTURE.md           ← detailed design
├── docker-compose.yml        ← one-command self-host
├── .env.example              ← all COWORKER_* env vars
├── backend/                  ← FastAPI Python service
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── app/
│       ├── main.py           ← FastAPI entrypoint, lifespan, routes
│       ├── settings.py       ← env config
│       ├── core/             ← event bus, approvals, audit, secrets
│       ├── ai/               ← router + 5 providers + budget tracker
│       ├── memory/           ← SQLite store + Chroma vector + RAG
│       ├── agents/           ← base + orchestrator + 18 specialists
│       ├── mcps/             ← registry + generator + builtin manifests
│       ├── connectors/       ← 29 integrations + encrypted secrets
│       ├── workflows/        ← engine + triggers + library
│       └── routes/           ← chat, agents, memory, mcps, connectors,
│                                workflows, approvals, events, system
└── src/                      ← Vite + React frontend (command center)
    ├── main.tsx
    └── app/
        ├── App.tsx           ← Shell + 8 route views
        ├── components/       ← Shell, CommandBar, shadcn primitives
        ├── routes/           ← Dashboard, ThinkingFeed, AgentsView, …
        └── lib/              ← api client + SSE hook
```

---

## License

MIT.
