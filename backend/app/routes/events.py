"""Server-Sent Events stream for the live thinking feed."""

from __future__ import annotations

import asyncio
import json

from fastapi import APIRouter, Query, Request
from sse_starlette.sse import EventSourceResponse

from ..core.event_bus import bus

router = APIRouter()


@router.get("/stream")
async def stream(
    request: Request,
    replay: int = Query(default=25, ge=0, le=500),
):
    async def gen():
        async for ev in bus.subscribe(replay=replay):
            if await request.is_disconnected():
                break
            yield {
                "event": ev.kind,
                "id": str(ev.seq),
                "data": json.dumps(ev.to_dict()),
            }
            # Yield control so other tasks get a turn under high event rates.
            await asyncio.sleep(0)

    return EventSourceResponse(gen(), ping=15)


@router.get("/history")
async def history(limit: int = Query(default=100, ge=1, le=500)):
    return {"events": [e.to_dict() for e in bus.history(limit=limit)]}
