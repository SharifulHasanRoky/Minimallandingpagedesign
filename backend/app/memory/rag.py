"""Retrieval pipeline: blends pinned + structured + vector hits."""

from __future__ import annotations

from typing import Any

from ..core.event_bus import bus
from .store import list_entries
from .vector import vector_store


async def recall(*, query: str, k: int = 8) -> list[dict[str, Any]]:
    """Return the top-k most relevant memory entries for a query.

    Pinned facts are always included first, then vector hits. Vector
    misses gracefully degrade to recent structured entries so the agent
    never gets nothing back."""
    pinned = [e for e in list_entries(limit=200) if e["pinned"]]
    pinned_ids = {p["id"] for p in pinned}

    vec = vector_store.query(query, k=k * 2)
    seen = set(pinned_ids)
    blended: list[dict[str, Any]] = []
    for p in pinned[:k]:
        blended.append({**p, "score": 1.0, "source": "pinned"})
    for hit in vec:
        if hit["id"] in seen:
            continue
        seen.add(hit["id"])
        blended.append({**hit, "source": "vector"})
        if len(blended) >= k:
            break

    if not blended:
        # No vectors yet (cold-start) - fall back to recent entries.
        for e in list_entries(limit=k):
            blended.append({**e, "score": 0.0, "source": "recent"})

    await bus.publish(
        "memory.recall",
        "memory",
        {"query": query[:200], "hits": len(blended), "k": k},
    )
    return blended[:k]
