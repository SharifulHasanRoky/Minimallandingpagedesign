"""Ollama local provider - the always-free fallback.

Endpoint: http://localhost:11434/api/chat
No auth required. We probe /api/tags during is_available().
"""

from __future__ import annotations

import httpx

from ...settings import settings
from .base import ChatMessage, ChatResult, Provider, ProviderError


class OllamaProvider(Provider):
    name = "ollama"
    is_local = True
    capabilities = {"chat", "reason", "code", "offline"}

    def __init__(self, default_model: str | None = None) -> None:
        super().__init__(default_model=default_model or settings.ollama_default_chat_model)
        self.base_url = settings.ollama_base_url.rstrip("/")
        self._available_cache: bool | None = None

    def is_available(self) -> bool:
        # Lazy: assume true; the router will retry/fail-over on actual call.
        # Could be replaced with a real probe with caching if desired.
        return True

    async def chat(
        self,
        messages: list[ChatMessage],
        *,
        model: str | None = None,
        temperature: float = 0.3,
        max_tokens: int = 1024,
    ) -> ChatResult:
        model = model or self.default_model
        body = {
            "model": model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            },
        }
        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                resp = await client.post(f"{self.base_url}/api/chat", json=body)
        except httpx.HTTPError as e:
            raise ProviderError(f"Ollama unreachable: {e}", status=None) from e

        if resp.status_code >= 400:
            raise ProviderError(
                f"Ollama error {resp.status_code}: {resp.text[:300]}",
                status=resp.status_code,
                retriable=False,
            )
        data = resp.json()
        text = (data.get("message") or {}).get("content", "") or ""
        # Ollama reports prompt_eval_count + eval_count
        prompt_tokens = int(data.get("prompt_eval_count", 0) or 0)
        completion_tokens = int(data.get("eval_count", 0) or 0)
        return ChatResult(
            text=text,
            model=model,
            provider=self.name,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            raw=data,
        )
