"""Approval queue routes - the human-in-the-loop API."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..core import audit
from ..core.approvals import approvals

router = APIRouter()


class DecisionRequest(BaseModel):
    approve: bool
    reason: str | None = None


@router.get("")
async def list_pending() -> list[dict]:
    return [a.to_dict() for a in approvals.list_all()]


@router.post("/{approval_id}/decide")
async def decide(approval_id: str, req: DecisionRequest) -> dict:
    a = await approvals.decide(approval_id, approve=req.approve, reason=req.reason)
    if a is None:
        raise HTTPException(404, "Approval not found")
    audit.record(
        actor="user",
        action="approval.decide",
        target=approval_id,
        effect_class="mutate_internal",
        inputs=req.model_dump(),
        outputs={"status": a.status},
    )
    return a.to_dict()


@router.post("/halt")
async def halt() -> dict:
    """Emergency stop. Freezes the system."""
    await approvals.halt()
    audit.record(
        actor="user",
        action="approvals.halt",
        effect_class="mutate_internal",
        inputs={},
        outputs={"halted": True},
    )
    return {"halted": True}


@router.post("/resume")
async def resume() -> dict:
    approvals.resume()
    audit.record(
        actor="user",
        action="approvals.resume",
        effect_class="mutate_internal",
        inputs={},
        outputs={"halted": False},
    )
    return {"halted": False}


@router.get("/audit")
async def get_audit(limit: int = 100) -> dict:
    return {"entries": audit.list_recent(limit=limit)}
