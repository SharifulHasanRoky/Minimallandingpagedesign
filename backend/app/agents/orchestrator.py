"""Orchestrator agent.

Pipeline:
  1. Persist user message to memory (conversation log).
  2. Recall relevant long-term memory via RAG.
  3. Ask the AI router to pick agents + plan (small JSON schema).
  4. Dispatch each step to the chosen specialist; events stream live.
  5. Have the orchestrator itself synthesize a final reply that cites the
     specialists' outputs.
  6. Hand the turn to the Memory agent (best-effort) to decide what to
     remember.

The plan format is intentionally tiny so the LLM almost always returns it
correctly even on a 3B local model. We accept loose JSON.
"""

from __future__ import annotations

import asyncio
import json
import re
from typing import Any

from ..ai.providers.base import ChatMessage
from ..ai.router import TaskHints, router
from ..core.event_bus import bus
from ..logging import get_logger
from ..memory import store as memstore
from ..memory.rag import recall
from .base import Agent

log = get_logger("orchestrator")


class Orchestrator(Agent):
    name = "orchestrator"
    description = "Plans tasks, dispatches specialist agents, merges results."
    task_kind = "reason"
    complexity = "high"
    tags = {"plan", "router", "merge"}
    system_prompt = (
        "You are the Orchestrator. You are an AI Chief of Staff. Given a "
        "user request, you produce a tiny plan as STRICT JSON of the form:\n"
        '{"steps": [{"agent": "<name>", "task": "<one-sentence task>"}, ...]}\n'
        "Constraints:\n"
        "- Use only agents from the provided roster.\n"
        "- Keep the plan to 1-3 steps for simple requests, up to 5 for complex.\n"
        "- For trivial small-talk, return an EMPTY steps list and answer "
        "directly via the orchestrator turn.\n"
        "- Output ONLY the JSON, no prose."
    )

    # ── Public API ─────────────────────────────────────────────────────
    async def handle_user_message(
        self,
        *,
        message: str,
        thread_id: str | None = None,
        prefer_local: bool = False,
    ) -> dict[str, Any]:
        from .registry import agent_registry  # late import - registry imports us

        thread_id = memstore.ensure_conversation(thread_id)
        memstore.append_message(thread_id, "user", message)
        await bus.publish(
            "agent.thought",
            self.name,
            {"message": f"Received user turn ({len(message)} chars)"},
        )

        # 1. Recall memory
        memory_hits = await recall(query=message, k=8)
        history = memstore.recent_messages(thread_id, limit=10)

        # 2. Plan
        plan = await self._plan(
            message=message,
            roster=agent_registry.describe_specialists(),
            memory=memory_hits,
            history=history,
            prefer_local=prefer_local,
        )
        await bus.publish("agent.thought", self.name, {"plan": plan})

        # 3. Dispatch concurrently when safe (no inter-step deps in skeleton)
        ctx_common = {
            "memory": memory_hits,
            "history": history,
            "prefer_local": prefer_local,
        }
        results: list[dict[str, Any]] = []
        if plan["steps"]:
            tasks = []
            for step in plan["steps"]:
                a = agent_registry.get(step["agent"])
                if a is None:
                    results.append(
                        {
                            "agent": step["agent"],
                            "ok": False,
                            "reply": f"Unknown agent: {step['agent']}",
                        }
                    )
                    continue
                tasks.append(
                    self._run_step(agent=a, task=step["task"], ctx=ctx_common)
                )
            if tasks:
                gathered = await asyncio.gather(*tasks, return_exceptions=True)
                for r in gathered:
                    if isinstance(r, Exception):
                        results.append({"agent": "unknown", "ok": False, "reply": str(r)})
                    else:
                        results.append(r)

        # 4. Synthesize final answer
        final = await self._synthesize(
            message=message,
            plan_steps=plan["steps"],
            results=results,
            memory=memory_hits,
            history=history,
            prefer_local=prefer_local,
        )

        memstore.append_message(
            thread_id,
            "assistant",
            final["reply"],
            meta={"provider": final.get("provider"), "model": final.get("model")},
        )
        await bus.publish(
            "agent.result",
            self.name,
            {"summary": final["reply"][:300], "steps": len(plan["steps"])},
        )

        # 5. Memory curation in the background (don't block the user)
        asyncio.create_task(self._curate_memory(message=message, reply=final["reply"]))

        return {
            "thread_id": thread_id,
            "reply": final["reply"],
            "plan": plan["steps"],
            "used_provider": final.get("provider"),
            "used_model": final.get("model"),
        }

    # ── Internal steps ─────────────────────────────────────────────────
    async def _plan(
        self,
        *,
        message: str,
        roster: list[dict[str, Any]],
        memory: list[dict[str, Any]],
        history: list[dict[str, Any]],
        prefer_local: bool,
    ) -> dict[str, Any]:
        roster_text = "\n".join(
            f"- {r['name']}: {r['description']}" for r in roster
        )
        sys = (
            self.system_prompt
            + "\n\nAvailable specialist agents:\n"
            + roster_text
        )
        user = (
            f"User request:\n{message}\n\n"
            "Return only the JSON plan."
        )
        try:
            res = await router.chat(
                [ChatMessage("system", sys), ChatMessage("user", user)],
                TaskHints(
                    kind="reason",
                    complexity="medium",
                    prefer_local=prefer_local,
                    max_tokens=512,
                    temperature=0.0,
                ),
            )
            plan = self._parse_plan(res.text)
        except Exception as e:  # noqa: BLE001
            log.warning("plan.failed", err=str(e)[:200])
            plan = {"steps": []}
        # Clamp + dedupe
        seen = set()
        clean: list[dict[str, str]] = []
        for s in plan.get("steps", [])[:5]:
            agent = s.get("agent")
            task = s.get("task")
            if not agent or not task or agent in seen:
                continue
            seen.add(agent)
            clean.append({"agent": agent, "task": task})
        return {"steps": clean}

    @staticmethod
    def _parse_plan(text: str) -> dict[str, Any]:
        text = (text or "").strip()
        # Strip ```json fences if present
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if not m:
            return {"steps": []}
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            return {"steps": []}

    async def _run_step(
        self,
        *,
        agent: Agent,
        task: str,
        ctx: dict[str, Any],
    ) -> dict[str, Any]:
        await bus.publish(
            "agent.tool_call",
            self.name,
            {"tool": f"agent:{agent.name}", "inputs": {"task": task}},
        )
        out = await agent.run(task=task, ctx=ctx)
        await bus.publish(
            "agent.tool_result",
            self.name,
            {"tool": f"agent:{agent.name}", "outputs": {"ok": out.get("ok", True)}},
        )
        return out

    async def _synthesize(
        self,
        *,
        message: str,
        plan_steps: list[dict[str, Any]],
        results: list[dict[str, Any]],
        memory: list[dict[str, Any]],
        history: list[dict[str, Any]],
        prefer_local: bool,
    ) -> dict[str, Any]:
        if not plan_steps:
            # Trivial case: answer directly.
            sys = (
                "You are the Coworker OS assistant. Reply briefly, helpfully, "
                "and in the user's preferred professional tone."
            )
            messages = [ChatMessage("system", sys)]
            for h in history[-6:]:
                if h["role"] in {"user", "assistant"}:
                    messages.append(ChatMessage(h["role"], h["content"]))
            messages.append(ChatMessage("user", message))
            try:
                res = await router.chat(
                    messages,
                    TaskHints(
                        kind="chat",
                        complexity="low",
                        prefer_local=prefer_local,
                        max_tokens=512,
                    ),
                )
                return {
                    "reply": res.text.strip(),
                    "provider": res.provider,
                    "model": res.model,
                }
            except Exception as e:  # noqa: BLE001
                return {
                    "reply": (
                        "I can't reach any AI provider right now. Configure a "
                        "free key (Gemini / OpenRouter / DeepSeek / HuggingFace) "
                        f"or start Ollama locally. ({e})"
                    ),
                    "provider": None,
                    "model": None,
                }

        # Build a synthesis prompt that cites specialists.
        bullets = []
        for r in results:
            if r.get("ok"):
                bullets.append(f"### {r['agent']}\n{(r.get('reply') or '').strip()}")
            else:
                bullets.append(
                    f"### {r['agent']}\n[failed: {r.get('reply', 'no detail')[:200]}]"
                )
        cite_block = "\n\n".join(bullets) or "(no specialist output)"
        sys = (
            "You are the Orchestrator finalising the answer. Synthesize the "
            "specialist outputs below into ONE coherent reply for the user. "
            "Be direct, structured (use markdown), no filler. Where useful, "
            "credit which specialist contributed."
        )
        user = (
            f"User request:\n{message}\n\n"
            f"Specialist outputs:\n{cite_block}\n\n"
            "Now write the final reply."
        )
        try:
            res = await router.chat(
                [ChatMessage("system", sys), ChatMessage("user", user)],
                TaskHints(
                    kind="reason",
                    complexity="medium",
                    prefer_local=prefer_local,
                    max_tokens=1200,
                    temperature=0.4,
                ),
            )
            return {
                "reply": res.text.strip(),
                "provider": res.provider,
                "model": res.model,
            }
        except Exception:  # noqa: BLE001
            # Ultimate fallback: concatenate specialist replies as-is.
            return {
                "reply": cite_block,
                "provider": None,
                "model": None,
            }

    async def _curate_memory(self, *, message: str, reply: str) -> None:
        from .registry import agent_registry

        memory_agent = agent_registry.get("memory_agent")
        if memory_agent is None:
            return
        try:
            out = await memory_agent.run(
                task=(
                    "Decide which long-term memory entries to persist from this "
                    f"interaction. User said:\n{message[:1000]}\n"
                    f"Assistant replied:\n{reply[:1000]}\n"
                    "Output JSON list as instructed."
                ),
                ctx={},
            )
            # Best-effort parse: list of {kind,text,pin?}
            text = out.get("reply") or ""
            m = re.search(r"\[.*\]", text, re.DOTALL)
            if not m:
                return
            entries = json.loads(m.group(0))
            for e in entries[:5]:
                kind = e.get("kind") or "note"
                txt = (e.get("text") or "").strip()
                if not txt:
                    continue
                await memstore.remember(
                    kind=kind, text=txt, pinned=bool(e.get("pin"))
                )
        except Exception as e:  # noqa: BLE001
            log.info("memory.curation_skipped", err=str(e)[:200])


orchestrator = Orchestrator()
