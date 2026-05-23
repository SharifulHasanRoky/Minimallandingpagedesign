"""Trigger definitions.

A trigger is a {kind, params} dict attached to a workflow. The engine's
scheduler loop checks pollable triggers (schedule, kpi_drop, anomaly).
Webhook and manual triggers are activated through the API.

Supported trigger kinds:
  manual       - run only via API
  schedule     - {interval_seconds: int}
  webhook      - {token: str}; engine treats these as opaque
  kpi_drop     - {metric: str, threshold_pct: float}
  anomaly      - {source: str, sensitivity: 'low'|'medium'|'high'}
  email        - {match: regex} (stub)
  file_upload  - {dir: path}    (stub)
"""

from __future__ import annotations

import time
from typing import Any


class TriggerState:
    """Tiny in-memory state for pollable triggers."""

    def __init__(self) -> None:
        self.last_fired_at: dict[str, float] = {}

    def due(self, workflow_id: str, interval_seconds: int) -> bool:
        last = self.last_fired_at.get(workflow_id, 0.0)
        return (time.time() - last) >= interval_seconds

    def mark(self, workflow_id: str) -> None:
        self.last_fired_at[workflow_id] = time.time()


def validate(trigger: dict[str, Any]) -> dict[str, Any]:
    kind = (trigger or {}).get("kind", "manual")
    if kind not in {
        "manual",
        "schedule",
        "webhook",
        "kpi_drop",
        "anomaly",
        "email",
        "file_upload",
    }:
        raise ValueError(f"unknown trigger kind: {kind}")
    if kind == "schedule":
        try:
            int(trigger.get("interval_seconds", 0))
        except (TypeError, ValueError) as e:
            raise ValueError("schedule.interval_seconds must be int") from e
        if int(trigger.get("interval_seconds", 0)) < 30:
            raise ValueError("schedule.interval_seconds must be >= 30")
    return trigger


trigger_state = TriggerState()
