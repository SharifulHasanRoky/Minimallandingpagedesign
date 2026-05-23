"""MCP (Model Context Protocol) registry.

A YAML/JSON manifest under mcps/builtin/ or data/mcps/ describes each
server. The registry loads them at startup and exposes their tools to
agents. Adding a new MCP = drop a manifest, hit POST /api/mcps/reload.

Manifest schema (loose):
    name: my-mcp
    description: ...
    transport: stdio | http
    command: ["python", "-m", "my_mcp"]   # for stdio
    url: http://localhost:9000             # for http
    tools:
      - name: search_docs
        description: ...
        input_schema: {type: object, properties: {...}}
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import yaml

from ..logging import get_logger
from ..settings import settings

log = get_logger("mcps.registry")

_BUILTIN_DIR = Path(__file__).parent / "builtin"
_USER_DIR = settings.data_dir / "mcps"


class MCPRegistry:
    def __init__(self) -> None:
        self._manifests: dict[str, dict[str, Any]] = {}

    def bootstrap(self) -> None:
        self._manifests.clear()
        _USER_DIR.mkdir(parents=True, exist_ok=True)
        for d in (_BUILTIN_DIR, _USER_DIR):
            if not d.exists():
                continue
            for p in sorted(d.glob("*.yaml")) + sorted(d.glob("*.yml")) + sorted(
                d.glob("*.json")
            ):
                try:
                    self._load_manifest(p)
                except Exception as e:  # noqa: BLE001
                    log.warning("mcp.load_failed", path=str(p), err=str(e)[:200])
        log.info("mcps.bootstrapped", count=len(self._manifests))

    def _load_manifest(self, path: Path) -> None:
        text = path.read_text()
        if path.suffix == ".json":
            data = json.loads(text)
        else:
            data = yaml.safe_load(text)
        if not isinstance(data, dict) or "name" not in data:
            raise ValueError("manifest must be a dict with a 'name' key")
        data.setdefault("source", str(path))
        data.setdefault("tools", [])
        data.setdefault("status", "loaded")
        self._manifests[data["name"]] = data

    # ── Public ─────────────────────────────────────────────────────────
    def list(self) -> list[dict[str, Any]]:
        return list(self._manifests.values())

    def get(self, name: str) -> dict[str, Any] | None:
        return self._manifests.get(name)

    def install_manifest(self, manifest: dict[str, Any]) -> Path:
        if "name" not in manifest:
            raise ValueError("manifest missing 'name'")
        _USER_DIR.mkdir(parents=True, exist_ok=True)
        path = _USER_DIR / f"{manifest['name']}.yaml"
        path.write_text(yaml.safe_dump(manifest, sort_keys=False))
        self._load_manifest(path)
        return path


mcp_registry = MCPRegistry()
