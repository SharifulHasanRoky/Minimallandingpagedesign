"""Workflow engine routes."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class WorkflowSpec(BaseModel):
    id: str | None = None
    name: str
    description: str = ""
    trigger: dict = {"kind": "manual"}
    steps: list[dict]
    enabled: bool = True


@router.get("")
async def list_workflows() -> list[dict]:
    from ..workflows.engine import workflow_engine

    return workflow_engine.list()


@router.get("/templates")
async def list_templates() -> list[dict]:
    from ..workflows.library.examples import EXAMPLES

    return EXAMPLES


@router.post("")
async def upsert(spec: WorkflowSpec) -> dict:
    from ..workflows.engine import workflow_engine

    return workflow_engine.upsert(spec.model_dump())


@router.post("/{wf_id}/run")
async def run(wf_id: str, payload: dict | None = None) -> dict:
    from ..workflows.engine import workflow_engine

    if not workflow_engine.has(wf_id):
        raise HTTPException(404, f"Unknown workflow: {wf_id}")
    return await workflow_engine.run(wf_id, payload=payload or {})


@router.post("/{wf_id}/simulate")
async def simulate(wf_id: str, payload: dict | None = None) -> dict:
    from ..workflows.engine import workflow_engine

    if not workflow_engine.has(wf_id):
        raise HTTPException(404, f"Unknown workflow: {wf_id}")
    return await workflow_engine.simulate(wf_id, payload=payload or {})
