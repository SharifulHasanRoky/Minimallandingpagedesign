"""Workflow engine.

A workflow is a tiny DAG of steps. Each step has:
  id           string
  kind         "agent" | "connector" | "memory" | "log" | "custom"
  inputs       dict
  effect_class read | compute | mutate_internal | mutate_external | spend_money
  needs        list[str]   (other step ids this depends on)

Execution is topo-sorted; independent steps run concurrently.
Steps with effect_class >= mutate_external go through the approval gate.

We persist specs (not run history) to SQLite so workflows survive restarts.
"""

from __future__ import annotations

import asyncio
import json
import sqlite3
import time
import uuid
from contextlib import contextmanager
from typing import Any

from ..core import audit
from ..core.approvals import approvals
from ..core.event_bus import bus
from ..logging import get_logger
from ..settings import settings
from .triggers import trigger_state, validate as validate_trigger

log = get_logger("workflows.engine")

_EFFECT_RANK = {
    "read": 0,
    "compute": 1,
    "mutate_internal": 2,
    "mutate_external": 3,
    "spend_money": 4,
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


def _init_table() -> None:
    with _conn() as c:
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS workflows (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                trigger TEXT NOT NULL,
                steps TEXT NOT NULL,
                enabled INTEGER NOT NULL DEFAULT 1,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL
            )
            """
        )


class WorkflowEngine:
    def __init__(self) -> None:
        self._cache: dict[str, dict[str, Any]] = {}
        self._scheduler_task: asyncio.Task | None = None
        self._stopped = asyncio.Event()

    # ── Lifecycle ──────────────────────────────────────────────────────
    async def start(self) -> None:
        _init_table()
        self._load_all()
        self._stopped.clear()
        if self._scheduler_task is None or self._scheduler_task.done():
            self._scheduler_task = asyncio.create_task(self._scheduler_loop())
        log.info("workflows.started", count=len(self._cache))

    async def stop(self) -> None:
        self._stopped.set()
        if self._scheduler_task is not None:
            self._scheduler_task.cancel()
            try:
                await self._scheduler_task
            except (asyncio.CancelledError, Exception):
                pass

    def _load_all(self) -> None:
        with _conn() as c:
            rows = c.execute("SELECT * FROM workflows").fetchall()
        self._cache = {
            r["id"]: {
                "id": r["id"],
                "name": r["name"],
                "description": r["description"] or "",
                "trigger": json.loads(r["trigger"]),
                "steps": json.loads(r["steps"]),
                "enabled": bool(r["enabled"]),
                "created_at": r["created_at"],
                "updated_at": r["updated_at"],
            }
            for r in rows
        }

    # ── CRUD ───────────────────────────────────────────────────────────
    def list(self) -> list[dict[str, Any]]:
        return list(self._cache.values())

    def get(self, wf_id: str) -> dict[str, Any] | None:
        return self._cache.get(wf_id)

    def has(self, wf_id: str) -> bool:
        return wf_id in self._cache

    def upsert(self, spec: dict[str, Any]) -> dict[str, Any]:
        wf_id = spec.get("id") or str(uuid.uuid4())
        steps = self._normalise_steps(spec.get("steps") or [])
        trigger = validate_trigger(spec.get("trigger") or {"kind": "manual"})
        now = time.time()
        record = {
            "id": wf_id,
            "name": spec.get("name") or f"workflow-{wf_id[:6]}",
            "description": spec.get("description") or "",
            "trigger": trigger,
            "steps": steps,
            "enabled": bool(spec.get("enabled", True)),
            "created_at": (self._cache.get(wf_id) or {}).get("created_at", now),
            "updated_at": now,
        }
        with _conn() as c:
            c.execute(
                """INSERT OR REPLACE INTO workflows
                   (id, name, description, trigger, steps, enabled, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    record["id"],
                    record["name"],
                    record["description"],
                    json.dumps(record["trigger"]),
                    json.dumps(record["steps"]),
                    1 if record["enabled"] else 0,
                    record["created_at"],
                    record["updated_at"],
                ),
            )
        self._cache[wf_id] = record
        audit.record(
            actor="user",
            action="workflow.upsert",
            target=wf_id,
            effect_class="mutate_internal",
            inputs={"name": record["name"], "steps": len(record["steps"])},
            outputs={"id": wf_id},
        )
        return record

    @staticmethod
    def _normalise_steps(steps: list[dict[str, Any]]) -> list[dict[str, Any]]:
        out = []
        seen_ids: set[str] = set()
        for i, s in enumerate(steps):
            sid = s.get("id") or f"s{i+1}"
            if sid in seen_ids:
                raise ValueError(f"duplicate step id: {sid}")
            seen_ids.add(sid)
            kind = s.get("kind", "agent")
            if kind not in {"agent", "connector", "memory", "log", "custom"}:
                raise ValueError(f"unknown step kind: {kind}")
            ec = s.get("effect_class", "compute")
            if ec not in _EFFECT_RANK:
                raise ValueError(f"unknown effect_class: {ec}")
            out.append(
                {
                    "id": sid,
                    "kind": kind,
                    "inputs": s.get("inputs", {}),
                    "effect_class": ec,
                    "needs": list(s.get("needs", [])),
                    "label": s.get("label", sid),
                }
            )
        # Validate dependency graph references
        ids = {s["id"] for s in out}
        for s in out:
            for d in s["needs"]:
                if d not in ids:
                    raise ValueError(f"step '{s['id']}' depends on missing '{d}'")
        return out

    # ── Run / simulate ─────────────────────────────────────────────────
    async def run(self, wf_id: str, *, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._execute(wf_id, payload=payload, simulate=False)

    async def simulate(self, wf_id: str, *, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._execute(wf_id, payload=payload, simulate=True)

    async def _execute(
        self,
        wf_id: str,
        *,
        payload: dict[str, Any],
        simulate: bool,
    ) -> dict[str, Any]:
        wf = self._cache.get(wf_id)
        if wf is None:
            raise KeyError(wf_id)

        run_id = str(uuid.uuid4())
        await bus.publish(
            "workflow.started",
            "workflows",
            {"id": wf_id, "name": wf["name"], "run_id": run_id, "simulate": simulate},
        )
        results: dict[str, dict[str, Any]] = {}

        # Topological execution: repeatedly pick steps whose deps are satisfied.
        remaining = {s["id"]: s for s in wf["steps"]}
        while remaining:
            ready = [
                s
                for s in remaining.values()
                if all(d in results for d in s["needs"])
            ]
            if not ready:
                # Cycle or impossible - bail.
                msg = "cycle or unresolved dependencies"
                await bus.publish(
                    "workflow.completed",
                    "workflows",
                    {"id": wf_id, "run_id": run_id, "ok": False, "error": msg},
                )
                return {"run_id": run_id, "ok": False, "error": msg, "results": results}

            outs = await asyncio.gather(
                *[
                    self._run_step(
                        wf=wf,
                        step=s,
                        payload=payload,
                        results=results,
                        run_id=run_id,
                        simulate=simulate,
                    )
                    for s in ready
                ],
                return_exceptions=True,
            )
            for s, o in zip(ready, outs):
                if isinstance(o, Exception):
                    results[s["id"]] = {"ok": False, "error": str(o)}
                else:
                    results[s["id"]] = o
                remaining.pop(s["id"], None)

        ok = all(r.get("ok") for r in results.values())
        await bus.publish(
            "workflow.completed",
            "workflows",
            {"id": wf_id, "run_id": run_id, "ok": ok, "simulate": simulate},
        )
        audit.record(
            actor="workflow",
            action=f"workflow.run:{wf_id}",
            target=wf_id,
            effect_class="mutate_internal",
            inputs={"payload": payload, "simulate": simulate},
            outputs={"ok": ok, "steps": len(results)},
            ok=ok,
        )
        return {"run_id": run_id, "ok": ok, "results": results}

    async def _run_step(
        self,
        *,
        wf: dict[str, Any],
        step: dict[str, Any],
        payload: dict[str, Any],
        results: dict[str, dict[str, Any]],
        run_id: str,
        simulate: bool,
    ) -> dict[str, Any]:
        ec = step["effect_class"]
        await bus.publish(
            "workflow.step",
            "workflows",
            {
                "wf": wf["id"],
                "run_id": run_id,
                "step": step["id"],
                "kind": step["kind"],
                "effect_class": ec,
                "phase": "started",
                "simulate": simulate,
            },
        )

        # Approval gate for high-risk effects
        if not simulate and _EFFECT_RANK[ec] >= _EFFECT_RANK["mutate_external"]:
            approval = await approvals.request(
                actor=f"workflow:{wf['id']}",
                action=f"workflow.step:{step['id']}",
                effect_class=ec,
                summary=(
                    f"Workflow '{wf['name']}' wants to run step '{step['id']}' "
                    f"({step['kind']}/{ec})."
                ),
                payload={"step": step, "payload": payload},
                ttl_seconds=600,
            )
            approval = await approvals.wait(approval)
            if approval.status != "approved":
                return {
                    "ok": False,
                    "skipped": True,
                    "reason": f"approval {approval.status}",
                }

        try:
            out = await self._dispatch(step, payload, results, simulate=simulate)
        except Exception as e:  # noqa: BLE001
            await bus.publish(
                "workflow.step",
                "workflows",
                {
                    "wf": wf["id"],
                    "run_id": run_id,
                    "step": step["id"],
                    "phase": "failed",
                    "error": str(e)[:300],
                },
            )
            return {"ok": False, "error": str(e)}

        await bus.publish(
            "workflow.step",
            "workflows",
            {
                "wf": wf["id"],
                "run_id": run_id,
                "step": step["id"],
                "phase": "completed",
                "ok": out.get("ok", True),
            },
        )
        return out

    async def _dispatch(
        self,
        step: dict[str, Any],
        payload: dict[str, Any],
        results: dict[str, dict[str, Any]],
        *,
        simulate: bool,
    ) -> dict[str, Any]:
        kind = step["kind"]
        inputs = step["inputs"] or {}

        if simulate:
            return {
                "ok": True,
                "simulated": True,
                "kind": kind,
                "inputs": inputs,
                "would_call": _describe_call(kind, inputs),
            }

        if kind == "log":
            return {"ok": True, "logged": str(inputs)[:500]}

        if kind == "memory":
            from ..memory.store import remember
            from ..memory.rag import recall

            op = inputs.get("op", "remember")
            if op == "remember":
                entry_id = await remember(
                    kind=inputs.get("kind", "note"),
                    text=inputs.get("text", ""),
                    metadata=inputs.get("metadata") or {},
                )
                return {"ok": True, "id": entry_id}
            elif op == "recall":
                hits = await recall(
                    query=inputs.get("query", ""), k=int(inputs.get("k", 8))
                )
                return {"ok": True, "hits": hits}
            return {"ok": False, "error": f"unknown memory op: {op}"}

        if kind == "agent":
            from ..agents.registry import agent_registry

            name = inputs.get("agent")
            task = inputs.get("task", "")
            agent = agent_registry.get(name) if name else None
            if agent is None:
                return {"ok": False, "error": f"unknown agent: {name}"}
            ctx = {"workflow_payload": payload, "previous": results}
            out = await agent.run(task=task, ctx=ctx)
            return {"ok": out.get("ok", True), "agent": name, "reply": out.get("reply")}

        if kind == "connector":
            # In skeleton form: surface what would be called. Real implementations
            # of each connector will override this in their own action module.
            return {
                "ok": True,
                "stub": True,
                "connector": inputs.get("connector"),
                "action": inputs.get("action"),
                "args": inputs.get("args", {}),
            }

        if kind == "custom":
            return {"ok": True, "custom": True, "inputs": inputs}

        return {"ok": False, "error": f"unknown step kind: {kind}"}

    # ── Scheduler ──────────────────────────────────────────────────────
    async def _scheduler_loop(self) -> None:
        try:
            while not self._stopped.is_set():
                await asyncio.sleep(15)
                for wf in list(self._cache.values()):
                    if not wf["enabled"]:
                        continue
                    trig = wf["trigger"] or {}
                    if trig.get("kind") != "schedule":
                        continue
                    interval = int(trig.get("interval_seconds", 0))
                    if interval <= 0:
                        continue
                    if not trigger_state.due(wf["id"], interval):
                        continue
                    trigger_state.mark(wf["id"])
                    asyncio.create_task(self.run(wf["id"], payload={"trigger": trig}))
        except asyncio.CancelledError:
            return


def _describe_call(kind: str, inputs: dict[str, Any]) -> str:
    if kind == "agent":
        return f"agent:{inputs.get('agent')} <- {inputs.get('task','')[:80]}"
    if kind == "connector":
        return f"{inputs.get('connector')}.{inputs.get('action')}({inputs.get('args', {})})"
    if kind == "memory":
        return f"memory.{inputs.get('op','remember')}"
    return kind


workflow_engine = WorkflowEngine()
