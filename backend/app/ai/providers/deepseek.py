"""DeepSeek provider - OpenAI-compatible.

Endpoint: https://api.deepseek.com/v1/chat/completions
DeepSeek currently offers generous free credits for new accounts and low
prices afterwards. The router treats it as 'cheap cloud' rather than
'truly free' but it shares the same OpenAI-compatible shape.
"""

from __future__ import annotations

import httpx

from ...settings import settings
from .base import ChatMessage, ChatResult, Provider, ProviderError

_DEEPSEEK_BASE = "https://api.deepseek.com/v1"


class DeepSeekProvider(Provider):
    name = "deepseek"
    is_local = False
    capabilities = {"chat", "reason", "code"}

    def __init__(self, default_model: str = "deepseek-chat") -> None:
        super().__init__(default_model=default_model)

    def is_available(self) -> bool:
        return bool(settings.deepseek_api_key)

    async def chat(
        self,
        messages: list[ChatMessage],
        *,
        model: str | None = None,
        temperature: float = 0.3,
        max_tokens: int = 1024,
    ) -> ChatResult:
        key = settings.deepseek_api_key
        if not key:
            raise ProviderError("DeepSeek key not configured", retriable=False)
        model = model or self.default_model

        body = {
            "model": model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                resp = await client.post(
                    f"{_DEEPSEEK_BASE}/chat/completions", json=body, headers=headers
                )
        except httpx.HTTPError as e:
            raise ProviderError(f"DeepSeek network error: {e}") from e

        if resp.status_code == 429:
            raise ProviderError("DeepSeek rate-limited", status=429)
        if resp.status_code >= 400:
            raise ProviderError(
                f"DeepSeek error {resp.status_code}: {resp.text[:300]}",
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
