"""AI Router - picks the cheapest free provider per task and fails over.

The router is the cost-optimization brain of the entire system.

Selection policy (default; configurable per-call via TaskHints):

  embed                 → local sentence-transformers (handled by memory.vector)
  chat / low complexity → Ollama → Gemini → OpenRouter free → HF
  chat / reasoning      → Gemini → OpenRouter free (deepseek-r1) → DeepSeek → Ollama
  code                  → DeepSeek → OpenRouter free (deepseek-coder)
                         → Ollama qwen2.5-coder → Gemini

`prefer_local=True` flips the order so Ollama is tried first regardless
of capability. This is what the UI's "offline" toggle wires to.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Literal

from ..core.event_bus import bus
from ..logging import get_logger
from ..settings import settings
from .budget import tracker
from .providers.base import ChatMessage, ChatResult, Provider, ProviderError
from .providers.deepseek import DeepSeekProvider
from .providers.gemini import GeminiProvider
from .providers.huggingface import HuggingFaceProvider
from .providers.ollama import OllamaProvider
from .providers.openrouter import OpenRouterProvider

log = get_logger("ai.router")

TaskKind = Literal["chat", "reason", "code", "summarize"]


@dataclass(slots=True)
class TaskHints:
    kind: TaskKind = "chat"
    complexity: Literal["low", "medium", "high"] = "low"
    prefer_local: bool = False
    max_tokens: int = 1024
    temperature: float = 0.3
    # Override the model on whichever provider is selected (rare).
    forced_model: str | None = None
    # Skip these providers (e.g. after one failed in this call).
    skip: set[str] | None = None


class AIRouter:
    def __init__(self) -> None:
        self._providers: dict[str, Provider] = {
            "ollama": OllamaProvider(),
            "gemini": GeminiProvider(),
            "openrouter": OpenRouterProvider(),
            "deepseek": DeepSeekProvider(),
            "huggingface": HuggingFaceProvider(),
        }

    # ── Public API ─────────────────────────────────────────────────────
    async def chat(
        self,
        messages: list[ChatMessage],
        hints: TaskHints | None = None,
    ) -> ChatResult:
        h = hints or TaskHints()
        chain = self._build_chain(h)

        last_error: ProviderError | None = None
        for provider in chain:
            await bus.publish(
                "router.selected",
                "ai.router",
                {
                    "provider": provider.name,
                    "is_local": provider.is_local,
                    "task": h.kind,
                    "complexity": h.complexity,
                },
            )
            t0 = time.time()
            try:
                result = await provider.chat(
                    messages,
                    model=h.forced_model,
                    temperature=h.temperature,
                    max_tokens=h.max_tokens,
                )
            except ProviderError as e:
                last_error = e
                tracker.record_failure(provider.name, status=e.status)
                await bus.publish(
                    "router.fallback",
                    "ai.router",
                    {
                        "from": provider.name,
                        "status": e.status,
                        "error": str(e)[:300],
                    },
                )
                log.warning(
                    "provider.failed",
                    provider=provider.name,
                    status=e.status,
                    err=str(e)[:300],
                )
                if not e.retriable and len(chain) > 1:
                    continue
                continue
            tracker.record_success(provider.name, tokens=result.total_tokens)
            log.info(
                "provider.ok",
                provider=provider.name,
                model=result.model,
                tokens=result.total_tokens,
                ms=int((time.time() - t0) * 1000),
            )
            return result

        # Total failure: surface the last error, or a clear "nothing free
        # available" message if no provider was even reachable.
        if last_error:
            raise last_error
        raise ProviderError(
            "No AI provider is available. Configure a free API key (Gemini "
            "/ OpenRouter / DeepSeek / HuggingFace) or run Ollama locally.",
            retriable=False,
        )

    def status(self) -> dict:
        return {
            "providers": [
                {
                    "name": name,
                    "is_local": p.is_local,
                    "available": p.is_available(),
                    "capabilities": sorted(p.capabilities),
                    "default_model": p.default_model,
                }
                for name, p in self._providers.items()
            ],
            "budget": tracker.snapshot(),
            "policy": {
                "daily_cloud_token_cap": settings.daily_cloud_token_cap,
                "daily_cloud_request_cap": settings.daily_cloud_request_cap,
            },
        }

    # ── Internal: build the candidate chain for a task ─────────────────
    def _build_chain(self, h: TaskHints) -> list[Provider]:
        skip = h.skip or set()
        # Ordered name lists per task profile. First entry = preferred.
        if h.kind == "code":
            order = ["deepseek", "openrouter", "ollama", "gemini", "huggingface"]
        elif h.kind == "reason" or h.complexity == "high":
            order = ["gemini", "openrouter", "deepseek", "ollama", "huggingface"]
        else:  # plain chat / low complexity
            order = ["ollama", "gemini", "openrouter", "huggingface", "deepseek"]

        if h.prefer_local:
            # Pull ollama to the front, keep relative order otherwise.
            order = ["ollama"] + [n for n in order if n != "ollama"]

        chain: list[Provider] = []
        for name in order:
            if name in skip:
                continue
            p = self._providers.get(name)
            if p is None:
                continue
            if not p.is_available():
                continue
            if not tracker.can_use(name, is_local=p.is_local):
                continue
            chain.append(p)
        return chain


router = AIRouter()
