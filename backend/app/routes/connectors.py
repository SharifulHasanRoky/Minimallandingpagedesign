"""Connectors registry routes."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class ConfigureRequest(BaseModel):
    credentials: dict[str, str]


@router.get("")
async def list_connectors() -> list[dict]:
    from ..connectors.registry import connector_registry

    return [c.describe() for c in connector_registry.list()]


@router.post("/{name}/configure")
async def configure(name: str, req: ConfigureRequest) -> dict:
    from ..connectors.registry import connector_registry

    connector = connector_registry.get(name)
    if connector is None:
        raise HTTPException(404, f"Unknown connector: {name}")
    connector.configure(req.credentials)
    return {"ok": True, "name": name, "configured": True}


@router.get("/{name}/health")
async def connector_health(name: str) -> dict:
    from ..connectors.registry import connector_registry

    connector = connector_registry.get(name)
    if connector is None:
        raise HTTPException(404, f"Unknown connector: {name}")
    return await connector.health()
