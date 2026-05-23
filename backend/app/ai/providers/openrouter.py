"""OpenRouter provider - lots of free `:free` models available.

OpenAI-compatible Chat Completions API.
"""

from __future__ import annotations

import httpx

from ...settings import settings
from .base import ChatMessage, ChatResult, Provider, ProviderError

_OPENROUTER_BASE = "https://openrouter.ai/api/v1"


class OpenRouterProvider(Provider):
    name = "openrouter"
    is_local = False
    capabilities = {"chat", "reason", "code"}

    def __init__(self, default_model: str = "deepseek/deepseek-r1:free") -> None:
        super().__init__(default_model=default_model)

    def is_available(self) -> bool:
        return bool(settings.openrouter_api_key)

    async def chat(
        self,
        messages: list[ChatMessage],
        *,
        model: str | None = None,
        temperature: float = 0.3,
        max_tokens: int = 1024,
    ) -> ChatResult:
        key = settings.openrouter_api_key
        if not key:
            raise ProviderError("OpenRouter key not configured", retriable=False)
        model = model or self.default_model

        body = {
            "model": model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            # Friendly attribution headers per OpenRouter conventions
            "HTTP-Referer": "https://github.com/SharifulHasanRoky/coworker-os",
            "X-Title": "Coworker OS",
        }
        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                resp = await client.post(
                    f"{_OPENROUTER_BASE}/chat/completions", json=body, headers=headers
                )
        except httpx.HTTPError as e:
            raise ProviderError(f"OpenRouter network error: {e}") from e

        if resp.status_code == 429:
            raise ProviderError("OpenRouter rate-limited", status=429)
        if resp.status_code >= 400:
            raise ProviderError(
                f"OpenRouter error {resp.status_code}: {resp.text[:300]}",
                status=resp.status_code,
                retriable=resp.status_code >= 500,
            )

        data = resp.json()
        try:
            text = data["choices"][0]["message"]["content"] or ""
        except (KeyError, IndexError):
            text = ""
        usage = data.get("usage", {})
        return ChatResult(
            text=text,
            model=model,
            provider=self.name,
            prompt_tokens=int(usage.get("prompt_tokens", 0) or 0),
            completion_tokens=int(usage.get("completion_tokens", 0) or 0),
            raw=data,
        )
