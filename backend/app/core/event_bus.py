"""In-process event bus used to stream agent thoughts, tool calls, approvals
and workflow steps to the UI over Server-Sent Events.

Design notes
------------
- Pure asyncio. No external broker required.
- Multiple subscribers fan-out via independent asyncio.Queues.
- Events are typed via a TypedDict and always carry a UTC timestamp + a
  monotonically increasing sequence id so the UI can detect drops.
- The bus also keeps a small ring buffer of the last N events so a fresh
  client gets immediate context when it subscribes.
"""

from __future__ import annotations

import asyncio
import itertools
import time
from collections import deque
from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from typing import Any, Literal

EventKind = Literal[
    "agent.thought",
    "agent.tool_call",
    "agent.tool_result",
    "agent.result",
    "agent.error",
    "approval.requested",
    "approval.resolved",
    "workflow.started",
    "workflow.step",
    "workflow.completed",
    "router.selected",
    "router.fallback",
    "memory.write",
    "memory.recall",
    "system.info",
]


@dataclass(slots=True)
class Event:
    seq: int
    kind: EventKind
    ts: float
    source: str
    payload: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "seq": self.seq,
            "kind": self.kind,
            "ts": self.ts,
            "source": self.source,
            "payload": self.payload,
        }


class EventBus:
    def __init__(self, *, history: int = 500) -> None:
        self._subscribers: set[asyncio.Queue[Event]] = set()
        self._lock = asyncio.Lock()
        self._counter = itertools.count(1)
        self._history: deque[Event] = deque(maxlen=history)

    # ── Producer side ──────────────────────────────────────────────────
    async def publish(
        self,
        kind: EventKind,
        source: str,
        payload: dict[str, Any] | None = None,
    ) -> Event:
        ev = Event(
            seq=next(self._counter),
            kind=kind,
            ts=time.time(),
            source=source,
            payload=payload or {},
        )
        self._history.append(ev)
        # Snapshot subscribers under lock so we don't iterate a mutating set.
        async with self._lock:
            queues = list(self._subscribers)
        for q in queues:
            # Non-blocking put: a slow consumer never stalls the producer.
            try:
                q.put_nowait(ev)
            except asyncio.QueueFull:
                # Drop oldest + retry once. Better to drop than to deadlock.
                try:
                    _ = q.get_nowait()
                    q.put_nowait(ev)
                except Exception:
                    pass
        return ev

    # ── Consumer side ──────────────────────────────────────────────────
    async def subscribe(
        self, *, replay: int = 25, queue_size: int = 256
    ) -> AsyncIterator[Event]:
        """Subscribe and yield events. Cancellation-safe."""
        q: asyncio.Queue[Event] = asyncio.Queue(maxsize=queue_size)
        async with self._lock:
            self._subscribers.add(q)
        try:
            # Replay tail of history first.
            tail = list(self._history)[-replay:]
            for ev in tail:
                yield ev
            while True:
                ev = await q.get()
                yield ev
        finally:
            async with self._lock:
                self._subscribers.discard(q)

    # ── Introspection ──────────────────────────────────────────────────
    def history(self, limit: int = 100) -> list[Event]:
        return list(self._history)[-limit:]

    @property
    def subscriber_count(self) -> int:
        return len(self._subscribers)


# Global singleton - the entire process shares one bus.
bus = EventBus()
