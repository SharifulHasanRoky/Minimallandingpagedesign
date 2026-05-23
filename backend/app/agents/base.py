"""Agent base class.

Every agent shares one shape:

    class MyAgent(Agent):
        name = "..."
        description = "..."
        system_prompt = "..."
        tags = {...}                  # capability tags the orchestrator routes on
        task_kind = "chat" | "reason" | "code"

        async def run(self, *, task: str, ctx: dict) -> dict:
            return await self.think(task, ctx)         # default: pure LLM call
"""

from __future__ import annotations

import time
from typing import Any, ClassVar, Literal

from ..ai.providers.base import ChatMessage
from ..ai.router import TaskHints, router
from ..core import audit
from ..core.approvals import approvals
from ..core.event_bus import bus

TaskKind = Literal["chat", "reason", "code", "summarize"]


class Agent:
    name: ClassVar[str] = "agent"
    description: ClassVar[str] = ""
    system_prompt: ClassVar[str] = "You are a helpful AI agent."
    tags: ClassVar[set[str]] = set()
    task_kind: ClassVar[TaskKind] = "chat"
    complexity: ClassVar[Literal["low", "medium", "high"]] = "medium"

    # ── Lifecycle ──────────────────────────────────────────────────────
    def __init__(self) -> None:
        self.created_at = time.time()

    def describe(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "tags": sorted(self.tags),
            "task_kind": self.task_kind,
            "complexity": self.complexity,
        }

    # ── Public entrypoint ──────────────────────────────────────────────
    async def run(self, *, task: str, ctx: dict[str, Any] | None = None) -> dict[str, Any]:
        ctx = ctx or {}
        await self.thought(f"Starting task: {task[:160]}")
        out = await self.think(task=task, ctx=ctx)
        await self.thought(f"Completed task → {len(out.get('reply', ''))} chars")
        await bus.publish(
            "agent.result",
            self.name,
            {"task": task[:200], "summary": (out.get("reply") or "")[:300]},
        )
        return out

    # ── Default thinking step (LLM call via free router) ───────────────
    async def think(self, *, task: str, ctx: dict[str, Any]) -> dict[str, Any]:
        memory_block = self._format_memory(ctx.get("memory"))
        messages = [
            ChatMessage(role="system", content=self.system_prompt),
        ]
        if memory_block:
            messages.append(
                ChatMessage(
                    role="system",
                    content=f"Relevant memory:\n{memory_block}",
                )
            )
        # Pull recent conversation if provided
        for m in ctx.get("history", []) or []:
            role = m.get("role", "user")
            content = m.get("content", "")
            if role in {"user", "assistant"} and content:
                messages.append(ChatMessage(role=role, content=content))
        messages.append(ChatMessage(role="user", content=task))

        hints = TaskHints(
            kind=self.task_kind,
            complexity=self.complexity,
            prefer_local=bool(ctx.get("prefer_local")),
            max_tokens=int(ctx.get("max_tokens", 1024)),
            temperature=float(ctx.get("temperature", 0.3)),
        )
        try:
            result = await router.chat(messages, hints)
        except Exception as e:  # noqa: BLE001
            await bus.publish(
                "agent.error",
                self.name,
                {"error": str(e)[:300]},
            )
            return {
                "agent": self.name,
                "reply": f"[{self.name}] could not run because no AI provider is "
                f"available: {e}. Configure a free API key or start Ollama.",
                "provider": None,
                "model": None,
                "tokens": 0,
                "ok": False,
            }
        return {
            "agent": self.name,
            "reply": result.text.strip(),
            "provider": result.provider,
            "model": result.model,
            "tokens": result.total_tokens,
            "ok": True,
        }

    # ── Thought-streaming convenience ──────────────────────────────────
    async def thought(self, message: str, **extra: Any) -> None:
        await bus.publish(
            "agent.thought",
            self.name,
            {"message": message[:1000], **extra},
        )

    async def tool_call(self, tool: str, inputs: dict[str, Any]) -> None:
        await bus.publish(
            "agent.tool_call",
            self.name,
            {"tool": tool, "inputs": inputs},
        )

    async def tool_result(self, tool: str, outputs: dict[str, Any]) -> None:
        await bus.publish(
            "agent.tool_result",
            self.name,
            {"tool": tool, "outputs": outputs},
        )

    # ── Approval-gated mutations ───────────────────────────────────────
    async def request_action(
        self,
        *,
        action: str,
        effect_class: audit.EffectClass,
        summary: str,
        target: str | None = None,
        payload: dict[str, Any] | None = None,
        ttl_seconds: int = 300,
    ) -> bool:
        approval = await approvals.request(
            actor=self.name,
            action=action,
            effect_class=effect_class,
            summary=summary,
            target=target,
            payload=payload,
            ttl_seconds=ttl_seconds,
        )
        approval = await approvals.wait(approval)
        ok = approval.status == "approved"
        audit.record(
            actor=self.name,
            action=action,
            target=target,
            effect_class=effect_class,
            inputs=payload or {},
            outputs={"approval": approval.status},
            ok=ok,
        )
        return ok

    # ── Helpers ────────────────────────────────────────────────────────
    @staticmethod
    def _format_memory(items: list[dict[str, Any]] | None) -> str:
        if not items:
            return ""
        out = []
        for it in items[:10]:
            kind = it.get("kind") or it.get("source") or "note"
            text = (it.get("text") or "")[:280]
            out.append(f"- [{kind}] {text}")
        return "\n".join(out)
