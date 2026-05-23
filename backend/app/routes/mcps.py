"""MCP server registry routes."""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class GenerateRequest(BaseModel):
    name: str
    purpose: str
    tools: list[str] = []


@router.get("")
async def list_mcps() -> list[dict]:
    from ..mcps.registry import mcp_registry

    return mcp_registry.list()


@router.post("/generate")
async def generate(req: GenerateRequest) -> dict:
    from ..mcps.generator import scaffold_mcp

    spec = await scaffold_mcp(name=req.name, purpose=req.purpose, tools=req.tools)
    return {"spec": spec}


@router.post("/reload")
async def reload_mcps() -> dict:
    from ..mcps.registry import mcp_registry

    mcp_registry.bootstrap()
    return {"loaded": len(mcp_registry.list())}
