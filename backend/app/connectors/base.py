"""Connector base class.

A connector is the integration boundary between Coworker OS and a third
party (Google Ads, Notion, Slack, Postgres, ...). Every connector:

  - declares its required credentials
  - stores them in the encrypted secret store, namespaced by connector name
  - exposes a `health()` ping
  - exposes a small set of `actions` the agents can request

In this skeleton most third-party connectors ship as STUBs - they record
what they would do, log it to the audit trail, and surface that to the
UI. As the user fleshes them out, the rest of the system stays unchanged.
"""

from __future__ import annotations

from typing import Any, ClassVar, Literal

from ..core import audit
from ..core.secrets import secrets_store

ConnectorStatus = Literal["unconfigured", "configured", "stub", "error"]


class Connector:
    name: ClassVar[str] = "connector"
    description: ClassVar[str] = ""
    category: ClassVar[str] = "misc"
    free_tier: ClassVar[bool] = True
    required_credentials: ClassVar[list[str]] = []
    docs_url: ClassVar[str] = ""

    def describe(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "free_tier": self.free_tier,
            "required_credentials": list(self.required_credentials),
            "docs_url": self.docs_url,
            "status": self.status(),
        }

    # ── Credentials ────────────────────────────────────────────────────
    def _key(self, field: str) -> str:
        return f"connector.{self.name}.{field}"

    def configure(self, credentials: dict[str, str]) -> None:
        for field in self.required_credentials:
            if field not in credentials:
                raise ValueError(f"missing credential: {field}")
        for k, v in credentials.items():
            secrets_store.set(self._key(k), v)
        audit.record(
            actor="user",
            action=f"connector.configure:{self.name}",
            target=self.name,
            effect_class="mutate_internal",
            inputs={"fields": list(credentials.keys())},
            outputs={"ok": True},
        )

    def get_credential(self, field: str) -> str | None:
        return secrets_store.get(self._key(field))

    def is_configured(self) -> bool:
        if not self.required_credentials:
            return True
        return all(self.get_credential(f) for f in self.required_credentials)

    def status(self) -> ConnectorStatus:
        if not self.required_credentials:
            return "stub"
        return "configured" if self.is_configured() else "unconfigured"

    # ── Health ─────────────────────────────────────────────────────────
    async def health(self) -> dict[str, Any]:
        """Default: just report config state. Real connectors should ping
        their upstream API here."""
        return {
            "name": self.name,
            "status": self.status(),
            "ok": self.status() in {"configured", "stub"},
        }
