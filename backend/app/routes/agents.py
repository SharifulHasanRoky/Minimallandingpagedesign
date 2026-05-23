"""List + invoke individual agents."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class InvokeRequest(BaseModel):
    task: str
    context: dict = {}


@router.get("")
async def list_agents() -> list[dict]:
    from ..agents.registry import agent_registry

    return agent_registry.describe_all()


@router.post("/{name}/invoke")
async def invoke_agent(name: str, req: InvokeRequest) -> dict:
    from ..agents.registry import agent_registry

    agent = agent_registry.get(name)
    if agent is None:
        raise HTTPException(404, f"Unknown agent: {name}")
    result = await agent.run(task=req.task, ctx=req.context)
    return {"agent": name, "result": result}
