"""Encrypted secret store for connector credentials.

- All values encrypted at rest with Fernet (AES-128 CBC + HMAC).
- The master key is taken from settings.master_key, or auto-generated and
  persisted under data/.master_key (chmod 600) on first run.
- Storage format on disk: a JSON object {name -> ciphertext_b64}.
"""

from __future__ import annotations

import base64
import json
import os
from pathlib import Path

from cryptography.fernet import Fernet, InvalidToken

from ..settings import settings


def _load_or_create_key() -> bytes:
    if settings.master_key:
        # Accept either a Fernet key or a raw passphrase (we'll derive).
        try:
            return base64.urlsafe_b64decode(settings.master_key.encode())
        except Exception:
            # Treat as passphrase: pad/truncate to 32 bytes then b64.
            raw = settings.master_key.encode("utf-8")
            raw = (raw + b"\0" * 32)[:32]
            return base64.urlsafe_b64encode(raw)

    key_path = settings.data_dir / ".master_key"
    if key_path.exists():
        return key_path.read_bytes().strip()

    key = Fernet.generate_key()
    key_path.write_bytes(key)
    try:
        os.chmod(key_path, 0o600)
    except OSError:
        # Windows / restricted FS - best effort.
        pass
    return key


class SecretStore:
    def __init__(self, path: Path | None = None) -> None:
        self._path = path or settings.secrets_path
        self._fernet = Fernet(_load_or_create_key())
        self._cache: dict[str, str] = {}
        self._loaded = False

    def _load(self) -> dict[str, str]:
        if self._loaded:
            return self._cache
        if not self._path.exists():
            self._cache = {}
            self._loaded = True
            return self._cache
        try:
            blob = json.loads(self._path.read_text())
        except json.JSONDecodeError:
            blob = {}
        self._cache = blob
        self._loaded = True
        return self._cache

    def _save(self) -> None:
        self._path.write_text(json.dumps(self._cache, indent=2, sort_keys=True))
        try:
            os.chmod(self._path, 0o600)
        except OSError:
            pass

    def set(self, name: str, value: str) -> None:
        self._load()
        token = self._fernet.encrypt(value.encode("utf-8")).decode("ascii")
        self._cache[name] = token
        self._save()

    def get(self, name: str) -> str | None:
        self._load()
        token = self._cache.get(name)
        if token is None:
            return None
        try:
            return self._fernet.decrypt(token.encode("ascii")).decode("utf-8")
        except InvalidToken:
            return None

    def delete(self, name: str) -> bool:
        self._load()
        if name in self._cache:
            del self._cache[name]
            self._save()
            return True
        return False

    def list_names(self) -> list[str]:
        self._load()
        return sorted(self._cache.keys())


secrets_store = SecretStore()
