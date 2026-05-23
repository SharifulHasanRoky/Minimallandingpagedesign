"""Structured memory in SQLite.

Two tables:
  memory_entries  - typed long-term facts (goals, projects, prefs, decisions, notes)
  conversations   - chat threads + messages (lightweight, for context replay)

We keep this layer sync (sqlite3) and call it from async code via the
default executor when needed. SQLite handles our concurrency just fine
for single-user workloads.
"""

from __future__ import annotations

import json
import sqlite3
import time
import uuid
from contextlib import contextmanager
from typing import Any

from ..core.event_bus import bus
from ..settings import settings

_KINDS = {
    "goal",
    "project",
    "preference",
    "decision",
    "note",
    "workflow",
    "kpi",
    "summary",
}


@contextmanager
def _conn():
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(settings.sqlite_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_memory() -> None:
    with _conn() as c:
        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS memory_entries (
                id TEXT PRIMARY KEY,
                kind TEXT NOT NULL,
                text TEXT NOT NULL,
                metadata TEXT NOT NULL DEFAULT '{}',
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL,
                pinned INTEGER NOT NULL DEFAULT 0
            );
            CREATE INDEX IF NOT EXISTS idx_memory_kind ON memory_entries(kind);
            CREATE INDEX IF NOT EXISTS idx_memory_pinned ON memory_entries(pinned);

            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                created_at REAL NOT NULL,
                title TEXT,
                summary TEXT
            );

            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                ts REAL NOT NULL,
                meta TEXT NOT NULL DEFAULT '{}',
                FOREIGN KEY(conversation_id) REFERENCES conversations(id)
            );
            CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id, ts);
            """
        )


# ── Memory entries (long-term facts) ───────────────────────────────────
async def remember(
    *,
    kind: str,
    text: str,
    metadata: dict[str, Any] | None = None,
    pinned: bool = False,
) -> str:
    if kind not in _KINDS:
        # Allow it but warn via event - we don't want to block the AI from
        # creating new categories on its own.
        await bus.publish(
            "system.info",
            "memory",
            {"msg": f"new memory kind '{kind}' (not in allow list, allowed)"},
        )
    entry_id = str(uuid.uuid4())
    now = time.time()
    with _conn() as c:
        c.execute(
            "INSERT INTO memory_entries (id, kind, text, metadata, created_at, updated_at, pinned) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                entry_id,
                kind,
                text,
                json.dumps(metadata or {}, default=str),
                now,
                now,
                1 if pinned else 0,
            ),
        )
    # Best-effort vector indexing (lazy import; never blocks the write).
    try:
        from .vector import vector_store

        vector_store.upsert(entry_id, text, {"kind": kind, **(metadata or {})})
    except Exception as e:  # noqa: BLE001
        await bus.publish("system.info", "memory", {"vector_index_failed": str(e)[:200]})
    await bus.publish(
        "memory.write",
        "memory",
        {"id": entry_id, "kind": kind, "text": text[:200]},
    )
    return entry_id


def list_entries(kind: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
    with _conn() as c:
        if kind:
            rows = c.execute(
                "SELECT * FROM memory_entries WHERE kind = ? "
                "ORDER BY pinned DESC, updated_at DESC LIMIT ?",
                (kind, limit),
            ).fetchall()
        else:
            rows = c.execute(
                "SELECT * FROM memory_entries "
                "ORDER BY pinned DESC, updated_at DESC LIMIT ?",
                (limit,),
            ).fetchall()
    return [
        {
            "id": r["id"],
            "kind": r["kind"],
            "text": r["text"],
            "metadata": json.loads(r["metadata"] or "{}"),
            "created_at": r["created_at"],
            "updated_at": r["updated_at"],
            "pinned": bool(r["pinned"]),
        }
        for r in rows
    ]


def get_entry(entry_id: str) -> dict[str, Any] | None:
    with _conn() as c:
        r = c.execute(
            "SELECT * FROM memory_entries WHERE id = ?", (entry_id,)
        ).fetchone()
    if not r:
        return None
    return {
        "id": r["id"],
        "kind": r["kind"],
        "text": r["text"],
        "metadata": json.loads(r["metadata"] or "{}"),
        "created_at": r["created_at"],
        "updated_at": r["updated_at"],
        "pinned": bool(r["pinned"]),
    }


def delete_entry(entry_id: str) -> bool:
    with _conn() as c:
        cur = c.execute("DELETE FROM memory_entries WHERE id = ?", (entry_id,))
        deleted = cur.rowcount > 0
    if deleted:
        try:
            from .vector import vector_store

            vector_store.delete(entry_id)
        except Exception:  # noqa: BLE001
            pass
    return deleted


# ── Conversations + messages ──────────────────────────────────────────
def ensure_conversation(thread_id: str | None = None, *, title: str | None = None) -> str:
    if thread_id:
        with _conn() as c:
            r = c.execute(
                "SELECT id FROM conversations WHERE id = ?", (thread_id,)
            ).fetchone()
            if r:
                return thread_id
    new_id = thread_id or str(uuid.uuid4())
    with _conn() as c:
        c.execute(
            "INSERT INTO conversations (id, created_at, title) VALUES (?, ?, ?)",
            (new_id, time.time(), title),
        )
    return new_id


def append_message(
    conversation_id: str,
    role: str,
    content: str,
    *,
    meta: dict[str, Any] | None = None,
) -> str:
    msg_id = str(uuid.uuid4())
    with _conn() as c:
        c.execute(
            "INSERT INTO messages (id, conversation_id, role, content, ts, meta) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (msg_id, conversation_id, role, content, time.time(), json.dumps(meta or {})),
        )
    return msg_id


def recent_messages(conversation_id: str, limit: int = 20) -> list[dict[str, Any]]:
    with _conn() as c:
        rows = c.execute(
            "SELECT id, role, content, ts, meta FROM messages "
            "WHERE conversation_id = ? ORDER BY ts ASC LIMIT ?",
            (conversation_id, limit),
        ).fetchall()
    return [
        {
            "id": r["id"],
            "role": r["role"],
            "content": r["content"],
            "ts": r["ts"],
            "meta": json.loads(r["meta"] or "{}"),
        }
        for r in rows
    ]
