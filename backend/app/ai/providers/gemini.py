"""Google Gemini via AI Studio free tier.

Endpoint: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
Auth: ?key=<API_KEY>
"""

from __future__ import annotations

import httpx

from ...settings import settings
from .base import ChatMessage, ChatResult, Provider, ProviderError

_GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"


class GeminiProvider(Provider):
    name = "gemini"
    is_local = False
    capabilities = {"chat", "reason", "long_context", "vision"}

    def __init__(self, default_model: str = "gemini-2.0-flash") -> None:
        super().__init__(default_model=default_model)

    def is_available(self) -> bool:
        return bool(settings.gemini_api_key)

    async def chat(
        self,
        messages: list[ChatMessage],
        *,
        model: str | None = None,
        temperature: float = 0.3,
        max_tokens: int = 1024,
    ) -> ChatResult:
        key = settings.gemini_api_key
        if not key:
            raise ProviderError("Gemini API key not configured", retriable=False)

        model = model or self.default_model
        # Gemini wants "contents" with role user/model and a system_instruction field.
        sys_text = "\n".join(m.content for m in messages if m.role == "system").strip()
        contents = []
        for m in messages:
            if m.role == "system":
                continue
            role = "user" if m.role == "user" else "model"
            contents.append({"role": role, "parts": [{"text": m.content}]})

        body: dict = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            },
        }
        if sys_text:
            body["systemInstruction"] = {"parts": [{"text": sys_text}]}

        url = f"{_GEMINI_BASE}/models/{model}:generateContent?key={key}"
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(url, json=body)
        except httpx.HTTPError as e:
            raise ProviderError(f"Gemini network error: {e}") from e

        if resp.status_code == 429:
            raise ProviderError("Gemini rate-limited", status=429)
        if resp.status_code >= 400:
            raise ProviderError(
                f"Gemini error {resp.status_code}: {resp.text[:300]}",
                status=resp.status_code,
                retriable=resp.status_code >= 500,
            )

        data = resp.json()
        try:
            text = data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError):
            text = ""
        usage = data.get("usageMetadata", {})
        return ChatResult(
            text=text,
            model=model,
            provider=self.name,
            prompt_tokens=int(usage.get("promptTokenCount", 0) or 0),
            completion_tokens=int(usage.get("candidatesTokenCount", 0) or 0),
            raw=data,
        )
