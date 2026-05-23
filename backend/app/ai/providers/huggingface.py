"""HuggingFace Inference API provider.

Uses the Router (https://router.huggingface.co/v1) which exposes an
OpenAI-compatible interface across many free hosted models.
"""

from __future__ import annotations

import httpx

from ...settings import settings
from .base import ChatMessage, ChatResult, Provider, ProviderError

_HF_BASE = "https://router.huggingface.co/v1"


class HuggingFaceProvider(Provider):
    name = "huggingface"
    is_local = False
    capabilities = {"chat", "embed"}

    def __init__(
        self, default_model: str = "meta-llama/Meta-Llama-3.1-8B-Instruct"
    ) -> None:
        super().__init__(default_model=default_model)

    def is_available(self) -> bool:
        return bool(settings.huggingface_api_key)

    async def chat(
        self,
        messages: list[ChatMessage],
        *,
        model: str | None = None,
        temperature: float = 0.3,
        max_tokens: int = 1024,
    ) -> ChatResult:
        key = settings.huggingface_api_key
        if not key:
            raise ProviderError("HuggingFace key not configured", retriable=False)
        model = model or self.default_model
        headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
        body = {
            "model": model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                resp = await client.post(
                    f"{_HF_BASE}/chat/completions", json=body, headers=headers
                )
        except httpx.HTTPError as e:
            raise ProviderError(f"HF network error: {e}") from e

        if resp.status_code == 429:
            raise ProviderError("HF rate-limited", status=429)
        if resp.status_code >= 400:
            raise ProviderError(
                f"HF error {resp.status_code}: {resp.text[:300]}",
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
