"""Memory inspection + write API."""

from __future__ import annotations

from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter()


class RememberRequest(BaseModel):
    kind: str  # goal | project | preference | decision | note
    text: str
    metadata: dict = {}


@router.post("/remember")
async def remember(req: RememberRequest) -> dict:
    from ..memory.store import remember as _remember

    entry_id = await _remember(kind=req.kind, text=req.text, metadata=req.metadata)
    return {"id": entry_id}


@router.get("/recall")
async def recall(q: str = Query(min_length=1), k: int = 8) -> dict:
    from ..memory.rag import recall as _recall

    hits = await _recall(query=q, k=k)
    return {"query": q, "hits": hits}


@router.get("")
async def list_memory(kind: str | None = None, limit: int = 50) -> dict:
    from ..memory.store import list_entries

    return {"entries": list_entries(kind=kind, limit=limit)}
