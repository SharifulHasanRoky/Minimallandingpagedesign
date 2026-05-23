"""Token / request budget tracker.

Each provider carries its own counter. The router consults the tracker
before sending and after receiving. When a provider hits its soft cap,
the router skips it for the rest of the rolling 24 h window.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from threading import Lock

from ..settings import settings


@dataclass(slots=True)
class ProviderUsage:
    name: str
    requests: int = 0
    tokens: int = 0
    last_429_at: float = 0.0
    cooldown_until: float = 0.0
    consecutive_failures: int = 0
    total_failures: int = 0
    window_started_at: float = field(default_factory=time.time)

    def maybe_reset_window(self, *, window_seconds: int = 24 * 3600) -> None:
        if time.time() - self.window_started_at >= window_seconds:
            self.requests = 0
            self.tokens = 0
            self.consecutive_failures = 0
            self.window_started_at = time.time()

    def in_cooldown(self) -> bool:
        return time.time() < self.cooldown_until

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "requests": self.requests,
            "tokens": self.tokens,
            "last_429_at": self.last_429_at,
            "cooldown_until": self.cooldown_until,
            "consecutive_failures": self.consecutive_failures,
            "total_failures": self.total_failures,
            "in_cooldown": self.in_cooldown(),
        }


class BudgetTracker:
    """Thread-safe even though the app is mostly async, since chromadb
    and other libs may run in worker threads."""

    def __init__(self) -> None:
        self._lock = Lock()
        self._usage: dict[str, ProviderUsage] = {}

    def _get(self, provider: str) -> ProviderUsage:
        u = self._usage.get(provider)
        if u is None:
            u = ProviderUsage(name=provider)
            self._usage[provider] = u
        u.maybe_reset_window()
        return u

    def can_use(self, provider: str, *, is_local: bool) -> bool:
        with self._lock:
            u = self._get(provider)
            if u.in_cooldown():
                return False
            if is_local:
                return True  # local has no quota
            return (
                u.requests < settings.daily_cloud_request_cap
                and u.tokens < settings.daily_cloud_token_cap
            )

    def record_success(self, provider: str, *, tokens: int) -> None:
        with self._lock:
            u = self._get(provider)
            u.requests += 1
            u.tokens += max(0, tokens)
            u.consecutive_failures = 0

    def record_failure(self, provider: str, *, status: int | None) -> None:
        with self._lock:
            u = self._get(provider)
            u.consecutive_failures += 1
            u.total_failures += 1
            if status == 429:
                # Exponential cooldown: 30s -> 1m -> 5m -> 15m -> 1h cap
                steps = [30, 60, 300, 900, 3600]
                cooldown = steps[min(u.consecutive_failures - 1, len(steps) - 1)]
                u.last_429_at = time.time()
                u.cooldown_until = time.time() + cooldown

    def snapshot(self) -> dict:
        with self._lock:
            return {name: u.to_dict() for name, u in self._usage.items()}


tracker = BudgetTracker()
