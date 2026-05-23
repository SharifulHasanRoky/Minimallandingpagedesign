"""Human-in-the-loop approval gate.

Any action with effect_class >= 'mutate_external' must pass through here
before it is allowed to execute. The approval object is published to the
event bus so the UI can render an approval modal in real time.

Auto-approval policy is read from settings on a per-class basis.
"""

from __future__ import annotations

import asyncio
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Literal

from ..settings import settings
from . import audit
from .event_bus import bus

ApprovalStatus = Literal["pending", "approved", "rejected", "expired", "halted"]


@dataclass(slots=True)
class Approval:
    id: str
    actor: str
    action: str
    effect_class: audit.EffectClass
    target: str | None
    summary: str
    payload: dict[str, Any]
    requested_at: float
    expires_at: float
    status: ApprovalStatus = "pending"
    decided_at: float | None = None
    decided_by: str | None = None
    reason: str | None = None
    _waiter: asyncio.Event = field(default_factory=asyncio.Event, repr=False)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "actor": self.actor,
            "action": self.action,
            "effect_class": self.effect_class,
            "target": self.target,
            "summary": self.summary,
            "payload": self.payload,
            "requested_at": self.requested_at,
            "expires_at": self.expires_at,
            "status": self.status,
            "decided_at": self.decided_at,
            "decided_by": self.decided_by,
            "reason": self.reason,
        }


class ApprovalManager:
    def __init__(self) -> None:
        self._items: dict[str, Approval] = {}
        self._halted: bool = False

    # ── Policy ─────────────────────────────────────────────────────────
    def auto_decision(self, effect_class: audit.EffectClass) -> ApprovalStatus | None:
        if self._halted:
            return "halted"
        if effect_class == "read" and settings.auto_approve_read_only:
            return "approved"
        if effect_class == "compute":
            return "approved"
        if (
            effect_class == "mutate_internal"
            and settings.auto_approve_internal_mutations
        ):
            return "approved"
        if (
            effect_class == "mutate_external"
            and settings.auto_approve_external_mutations
        ):
            return "approved"
        if effect_class == "spend_money" and settings.auto_approve_spend:
            return "approved"
        return None  # needs human

    # ── Request / wait ─────────────────────────────────────────────────
    async def request(
        self,
        *,
        actor: str,
        action: str,
        effect_class: audit.EffectClass,
        summary: str,
        target: str | None = None,
        payload: dict[str, Any] | None = None,
        ttl_seconds: int = 300,
    ) -> Approval:
        auto = self.auto_decision(effect_class)
        now = time.time()
        approval = Approval(
            id=str(uuid.uuid4()),
            actor=actor,
            action=action,
            effect_class=effect_class,
            target=target,
            summary=summary,
            payload=payload or {},
            requested_at=now,
            expires_at=now + ttl_seconds,
        )
        if auto is not None:
            approval.status = auto
            approval.decided_at = now
            approval.decided_by = "system"
            approval._waiter.set()
        self._items[approval.id] = approval
        await bus.publish(
            "approval.requested" if auto is None else "approval.resolved",
            actor,
            approval.to_dict(),
        )
        return approval

    async def wait(self, approval: Approval) -> Approval:
        if approval.status != "pending":
            return approval
        try:
            await asyncio.wait_for(
                approval._waiter.wait(),
                timeout=max(1.0, approval.expires_at - time.time()),
            )
        except asyncio.TimeoutError:
            approval.status = "expired"
            approval.decided_at = time.time()
            approval.decided_by = "system"
            await bus.publish("approval.resolved", approval.actor, approval.to_dict())
        return approval

    # ── Decide ─────────────────────────────────────────────────────────
    async def decide(
        self,
        approval_id: str,
        *,
        approve: bool,
        decided_by: str = "user",
        reason: str | None = None,
    ) -> Approval | None:
        approval = self._items.get(approval_id)
        if approval is None:
            return None
        if approval.status != "pending":
            return approval
        approval.status = "approved" if approve else "rejected"
        approval.decided_at = time.time()
        approval.decided_by = decided_by
        approval.reason = reason
        approval._waiter.set()
        await bus.publish("approval.resolved", approval.actor, approval.to_dict())
        return approval

    # ── Listing / control ──────────────────────────────────────────────
    def list_all(self) -> list[Approval]:
        return list(self._items.values())

    def get(self, approval_id: str) -> Approval | None:
        return self._items.get(approval_id)

    async def halt(self) -> None:
        """Emergency stop. Any pending approvals are rejected and future
        approval requests immediately resolve as 'halted'."""
        self._halted = True
        for a in self._items.values():
            if a.status == "pending":
                a.status = "halted"
                a.decided_at = time.time()
                a.decided_by = "system"
                a._waiter.set()
        await bus.publish("system.info", "approvals", {"halted": True})

    def resume(self) -> None:
        self._halted = False

    @property
    def is_halted(self) -> bool:
        return self._halted


approvals = ApprovalManager()
