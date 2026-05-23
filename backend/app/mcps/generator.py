"""AI-powered MCP scaffolder.

Given (name, purpose, tool list), the mcp_builder agent designs a
manifest and a Python skeleton. We persist the manifest to disk so the
registry can load it on next boot.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from ..agents.registry import agent_registry
from ..core.event_bus import bus
from ..logging import get_logger
from ..settings import settings
from .registry import mcp_registry

log = get_logger("mcps.generator")


async def scaffold_mcp(
    *, name: str, purpose: str, tools: list[str]
) -> dict[str, Any]:
    """Produce a manifest + impl stub. Persists the manifest.

    The Python skeleton is written next to the manifest so the user can
    iterate on it. We DO NOT run untrusted generated code automatically;
    activation is a manual step until the user reviews."""

    builder = agent_registry.get("mcp_builder")
    safe_name = re.sub(r"[^a-zA-Z0-9_-]+", "-", name).strip("-").lower() or "mcp"

    if builder is None:
        manifest = _fallback_manifest(safe_name, purpose, tools)
    else:
        prompt = (
            f"Design an MCP server.\n"
            f"name: {safe_name}\n"
            f"purpose: {purpose}\n"
            f"tools: {tools}\n\n"
            "Return TWO blocks:\n"
            "1) A JSON object for the manifest.\n"
            "2) A fenced ```python code block with a runnable stdio MCP "
            "skeleton using the official mcp Python SDK (placeholders OK). "
            "No prose."
        )
        out = await builder.run(task=prompt, ctx={})
        manifest, _impl = _parse_builder_output(out.get("reply", ""))
        if manifest is None:
            manifest = _fallback_manifest(safe_name, purpose, tools)
        manifest["name"] = safe_name  # enforce the canonical name

    # Persist
    out_dir = settings.data_dir / "mcps"
    out_dir.mkdir(parents=True, exist_ok=True)
    impl_path = out_dir / f"{safe_name}_server.py"
    if not impl_path.exists():
        impl_path.write_text(_python_stub(safe_name, purpose, tools))

    mcp_registry.install_manifest(manifest)
    await bus.publish(
        "system.info",
        "mcp_builder",
        {"msg": f"scaffolded MCP '{safe_name}'", "tools": tools},
    )
    return manifest


def _fallback_manifest(name: str, purpose: str, tools: list[str]) -> dict[str, Any]:
    return {
        "name": name,
        "description": purpose,
        "transport": "stdio",
        "command": ["python", f"-m", f"mcps.{name}_server"],
        "tools": [
            {
                "name": t,
                "description": f"Auto-generated tool: {t}",
                "input_schema": {"type": "object", "properties": {}},
            }
            for t in tools
        ],
        "status": "scaffolded",
    }


def _parse_builder_output(text: str) -> tuple[dict[str, Any] | None, str | None]:
    manifest = None
    impl = None
    # Extract first JSON object
    m = re.search(r"\{[\s\S]*?\}", text)
    if m:
        try:
            manifest = json.loads(m.group(0))
        except json.JSONDecodeError:
            manifest = None
    # Extract first python code block
    m = re.search(r"```python\s*([\s\S]*?)```", text, re.IGNORECASE)
    if m:
        impl = m.group(1).strip()
    return manifest, impl


def _python_stub(name: str, purpose: str, tools: list[str]) -> str:
    tools_list = "\n".join(f'    "{t}",' for t in tools)
    return f'''"""Auto-generated MCP server stub: {name}

Purpose: {purpose}

This is a SKELETON. Review and edit before activating. Run with:
    python {name}_server.py
"""

from __future__ import annotations

# Replace with the official mcp Python SDK once installed:
#   pip install mcp
# from mcp.server.stdio import stdio_server
# from mcp.server import Server

TOOLS = [
{tools_list}
]


def main() -> None:
    """Replace with real MCP stdio loop."""
    print("[{name}] starting (stub)")
    print("Tools registered:", TOOLS)


if __name__ == "__main__":
    main()
'''
