"""Centralised configuration. All values have free defaults so the system
runs out-of-the-box with zero spend."""

from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="COWORKER_",
        extra="ignore",
        case_sensitive=False,
    )

    # ── Runtime ─────────────────────────────────────────────────────────
    env: Literal["dev", "prod"] = "dev"
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
        ]
    )

    # ── Storage ─────────────────────────────────────────────────────────
    data_dir: Path = Path("./data")
    sqlite_path: Path = Path("./data/coworker.db")
    chroma_dir: Path = Path("./data/chroma")
    secrets_path: Path = Path("./data/secrets.enc")

    # ── Security ────────────────────────────────────────────────────────
    # If unset, a per-install key is generated on first boot and persisted
    # under data/.master_key (gitignored). NEVER commit this.
    master_key: str | None = None

    # ── AI providers (all optional, all free tiers) ─────────────────────
    gemini_api_key: str | None = None
    openrouter_api_key: str | None = None
    deepseek_api_key: str | None = None
    huggingface_api_key: str | None = None

    # Local Ollama (always free, default fallback)
    ollama_base_url: str = "http://localhost:11434"
    ollama_default_chat_model: str = "qwen2.5:3b"
    ollama_default_code_model: str = "qwen2.5-coder:7b"
    ollama_default_reason_model: str = "qwen2.5:14b"

    # ── Budgets (free-tier safe defaults) ───────────────────────────────
    # Soft daily caps. The router enforces these even if upstream allows more.
    daily_cloud_token_cap: int = 200_000
    daily_cloud_request_cap: int = 1_000

    # ── Approval policy ─────────────────────────────────────────────────
    auto_approve_read_only: bool = True
    auto_approve_internal_mutations: bool = False
    auto_approve_external_mutations: bool = False  # never auto-approve external
    auto_approve_spend: bool = False  # never auto-approve spend

    @property
    def cloud_provider_keys(self) -> dict[str, str | None]:
        return {
            "gemini": self.gemini_api_key,
            "openrouter": self.openrouter_api_key,
            "deepseek": self.deepseek_api_key,
            "huggingface": self.huggingface_api_key,
        }

    def ensure_dirs(self) -> None:
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.chroma_dir.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_dirs()
