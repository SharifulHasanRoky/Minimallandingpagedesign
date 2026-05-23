"""Chat route - thin wrapper that hands a user turn to the orchestrator."""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    thread_id: str | None = None
    prefer_local: bool = False


class ChatResponse(BaseModel):
    thread_id: str
    reply: str
    plan: list[dict] = []
    used_provider: str | None = None
    used_model: str | None = None


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    # Lazy import: orchestrator depends on the AI router which depends on httpx.
    from ..agents.orchestrator import orchestrator

    result = await orchestrator.handle_user_message(
        message=req.message,
        thread_id=req.thread_id,
        prefer_local=req.prefer_local,
    )
    return ChatResponse(**result)
