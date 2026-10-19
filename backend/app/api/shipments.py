"""
Shipments and Critical Supply Tracking API router.
Supports supply tracking, cargo categories (Medicine, Food, Fuel, etc.),
priority scores, and reroute trigger status.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from backend.app.services.data_store import store

router = APIRouter(prefix="/api/shipments", tags=["Shipments"])


@router.get("")
def list_shipments(
    limit: Optional[int] = Query(default=None, ge=1, le=500),
    offset: int = Query(default=0, ge=0)
):
    """List all scheduled and active consignments sorted by priority."""
    ships = sorted(store.get_shipments(), key=lambda s: s.get("priority", 0), reverse=True)
    if limit is not None:
        return ships[offset : offset + limit]
    return ships


@router.get("/{shipment_id}")
def get_shipment(shipment_id: str):
    for s in store.shipments:
        if s["id"] == shipment_id:
            return s
    raise HTTPException(status_code=404, detail="Shipment not found")
