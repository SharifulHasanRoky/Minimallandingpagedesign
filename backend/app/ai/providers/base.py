"""Provider abstraction. One narrow interface, every backend implements it."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class ChatMessage:
    role: str  # "system" | "user" | "assistant"
    content: str


@dataclass(slots=True)
class ChatResult:
    text: str
    model: str
    provider: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    raw: dict[str, Any] | None = None

    @property
    def total_tokens(self) -> int:
        return self.prompt_tokens + self.completion_tokens


class ProviderError(Exception):
    def __init__(self, message: str, *, status: int | None = None, retriable: bool = True):
        super().__init__(message)
        self.status = status
        self.retriable = retriable


class Provider(ABC):
    name: str
    is_local: bool = False
    # Loose capability tags the router consults.
    capabilities: set[str] = set()

    def __init__(self, *, default_model: str):
        self.default_model = default_model

    def is_available(self) -> bool:
        return True

    @abstractmethod
    async def chat(
        self,
        messages: list[ChatMessage],
        *,
        model: str | None = None,
        temperature: float = 0.3,
        max_tokens: int = 1024,
    ) -> ChatResult: ...
