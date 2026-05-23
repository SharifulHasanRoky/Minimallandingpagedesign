"""Connector registry."""

from __future__ import annotations

from .base import Connector
from .catalog import CATALOG


class ConnectorRegistry:
    def __init__(self) -> None:
        self._connectors: dict[str, Connector] = {}
        self._booted = False

    def bootstrap(self) -> None:
        if self._booted:
            return
        for cls in CATALOG:
            inst = cls()
            self._connectors[inst.name] = inst
        self._booted = True

    def list(self) -> list[Connector]:
        return list(self._connectors.values())

    def get(self, name: str) -> Connector | None:
        return self._connectors.get(name)

    def by_category(self) -> dict[str, list[Connector]]:
        out: dict[str, list[Connector]] = {}
        for c in self._connectors.values():
            out.setdefault(c.category, []).append(c)
        return out


connector_registry = ConnectorRegistry()
