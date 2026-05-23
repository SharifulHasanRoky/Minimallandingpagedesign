"""FastAPI entrypoint for the Coworker OS backend."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import __version__
from .core import audit
from .core.event_bus import bus
from .logging import configure_logging, get_logger
from .settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    log = get_logger("startup")
    audit.init_audit()

    # Lazy imports so the app can boot even if optional deps are missing.
    from .memory.store import init_memory
    from .memory.vector import init_vector_store
    from .mcps.registry import mcp_registry
    from .connectors.registry import connector_registry
    from .workflows.engine import workflow_engine
    from .agents.registry import agent_registry

    init_memory()
    init_vector_store()
    mcp_registry.bootstrap()
    connector_registry.bootstrap()
    agent_registry.bootstrap()
    await workflow_engine.start()

    await bus.publish(
        "system.info",
        "system",
        {
            "msg": "Coworker OS backend started",
            "version": __version__,
            "env": settings.env,
            "agents": agent_registry.count(),
            "connectors": len(connector_registry.list()),
            "mcps": len(mcp_registry.list()),
        },
    )
    log.info(
        "coworker.started",
        version=__version__,
        agents=agent_registry.count(),
        connectors=len(connector_registry.list()),
        mcps=len(mcp_registry.list()),
    )

    try:
        yield
    finally:
        await workflow_engine.stop()
        log.info("coworker.stopped")


app = FastAPI(
    title="Coworker OS",
    version=__version__,
    description="Free, self-hosted, AI-native Personal Coworker Operating System.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers (mounted lazily to keep import cycles clean) ───────────────
from .routes import (  # noqa: E402
    agents as agents_routes,
    approvals as approvals_routes,
    chat as chat_routes,
    connectors as connectors_routes,
    events as events_routes,
    mcps as mcps_routes,
    memory as memory_routes,
    system as system_routes,
    workflows as workflows_routes,
)

app.include_router(chat_routes.router, prefix="/api/chat", tags=["chat"])
app.include_router(agents_routes.router, prefix="/api/agents", tags=["agents"])
app.include_router(memory_routes.router, prefix="/api/memory", tags=["memory"])
app.include_router(mcps_routes.router, prefix="/api/mcps", tags=["mcps"])
app.include_router(connectors_routes.router, prefix="/api/connectors", tags=["connectors"])
app.include_router(workflows_routes.router, prefix="/api/workflows", tags=["workflows"])
app.include_router(approvals_routes.router, prefix="/api/approvals", tags=["approvals"])
app.include_router(events_routes.router, prefix="/api/events", tags=["events"])
app.include_router(system_routes.router, prefix="/api/system", tags=["system"])


@app.get("/api/health")
async def health() -> dict[str, object]:
    return {
        "ok": True,
        "version": __version__,
        "env": settings.env,
        "subscribers": bus.subscriber_count,
    }


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "name": "Coworker OS",
        "version": __version__,
        "docs": "/docs",
        "health": "/api/health",
    }
