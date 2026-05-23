"""System-level routes: AI router state, budget snapshot, top-level summary."""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()


@router.get("/router")
async def router_status() -> dict:
    from ..ai.router import router as ai_router

    return ai_router.status()


@router.get("/summary")
async def summary() -> dict:
    from ..agents.registry import agent_registry
    from ..ai.router import router as ai_router
    from ..connectors.registry import connector_registry
    from ..core.approvals import approvals
    from ..mcps.registry import mcp_registry
    from ..memory.vector import vector_store
    from ..workflows.engine import workflow_engine

    pending_approvals = sum(
        1 for a in approvals.list_all() if a.status == "pending"
    )
    return {
        "agents": {
            "count": agent_registry.count(),
            "names": [a["name"] for a in agent_registry.describe_all()],
        },
        "connectors": {
            "count": len(connector_registry.list()),
            "configured": sum(
                1 for c in connector_registry.list() if c.is_configured()
            ),
        },
        "mcps": {"count": len(mcp_registry.list())},
        "workflows": {
            "count": len(workflow_engine.list()),
            "enabled": sum(1 for w in workflow_engine.list() if w["enabled"]),
        },
        "approvals": {
            "pending": pending_approvals,
            "halted": approvals.is_halted,
        },
        "memory": vector_store.info(),
        "ai_router": ai_router.status(),
    }
