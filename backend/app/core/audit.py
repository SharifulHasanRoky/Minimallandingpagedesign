"""Append-only audit log of every meaningful action in the system.

Entries record:
  - actor (agent/system/user)
  - action verb + target
  - inputs (redacted) and outputs (truncated)
  - effect_class (read | compute | mutate_internal | mutate_external | spend_money)
  - rollback_hint (free-form string the rollback machinery can interpret)

Stored in SQLite via the shared store. Kept simple and sync to avoid a
transaction dependency tree across the codebase.
"""

from __future__ import annotations

import json
import sqlite3
import time
import uuid
from contextlib import contextmanager
from typing import Any, Literal

from ..settings import settings

EffectClass = Literal[
    "read",
    "compute",
    "mutate_internal",
    "mutate_external",
    "spend_money",
]


@contextmanager
def _conn():
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(settings.sqlite_path)
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_audit() -> None:
    with _conn() as c:
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS audit_log (
                id TEXT PRIMARY KEY,
                ts REAL NOT NULL,
                actor TEXT NOT NULL,
                action TEXT NOT NULL,
                target TEXT,
                effect_class TEXT NOT NULL,
                inputs TEXT,
                outputs TEXT,
                rollback_hint TEXT,
                ok INTEGER NOT NULL DEFAULT 1
            )
            """
        )
        c.execute("CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_log(ts)")
        c.execute("CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor)")


def record(
    *,
    actor: str,
    action: str,
    effect_class: EffectClass,
    target: str | None = None,
    inputs: dict[str, Any] | None = None,
    outputs: dict[str, Any] | None = None,
    rollback_hint: str | None = None,
    ok: bool = True,
) -> str:
    entry_id = str(uuid.uuid4())
    with _conn() as c:
        c.execute(
            """
            INSERT INTO audit_log
              (id, ts, actor, action, target, effect_class, inputs, outputs, rollback_hint, ok)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entry_id,
                time.time(),
                actor,
                action,
                target,
                effect_class,
                json.dumps(inputs or {}, default=str)[:8000],
                json.dumps(outputs or {}, default=str)[:8000],
                rollback_hint,
                1 if ok else 0,
            ),
        )
    return entry_id


def list_recent(limit: int = 100) -> list[dict[str, Any]]:
    with _conn() as c:
        rows = c.execute(
            "SELECT id, ts, actor, action, target, effect_class, inputs, outputs, "
            "rollback_hint, ok FROM audit_log ORDER BY ts DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return [
        {
            "id": r[0],
            "ts": r[1],
            "actor": r[2],
            "action": r[3],
            "target": r[4],
            "effect_class": r[5],
            "inputs": json.loads(r[6] or "{}"),
            "outputs": json.loads(r[7] or "{}"),
            "rollback_hint": r[8],
            "ok": bool(r[9]),
        }
        for r in rows
    ]
