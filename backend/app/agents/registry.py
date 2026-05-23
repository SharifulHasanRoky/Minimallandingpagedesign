"""Agent registry - the orchestrator and routes use this to look up agents."""

from __future__ import annotations

from typing import Any

from .base import Agent
from .orchestrator import orchestrator
from .specialists import SPECIALISTS


class AgentRegistry:
    def __init__(self) -> None:
        self._agents: dict[str, Agent] = {}
        self._booted = False

    def bootstrap(self) -> None:
        if self._booted:
            return
        # Orchestrator is special - registered but not in the specialist roster.
        self._agents[orchestrator.name] = orchestrator
        for cls in SPECIALISTS:
            inst = cls()
            self._agents[inst.name] = inst
        self._booted = True

    # ── Lookup ─────────────────────────────────────────────────────────
    def get(self, name: str) -> Agent | None:
        return self._agents.get(name)

    def has(self, name: str) -> bool:
        return name in self._agents

    def count(self) -> int:
        return len(self._agents)

    # ── Listing ────────────────────────────────────────────────────────
    def describe_all(self) -> list[dict[str, Any]]:
        return [a.describe() for a in self._agents.values()]

    def describe_specialists(self) -> list[dict[str, Any]]:
        return [
            a.describe()
            for a in self._agents.values()
            if a.name != orchestrator.name
        ]


agent_registry = AgentRegistry()
