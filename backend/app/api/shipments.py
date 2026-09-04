"""
Shipments and Critical Supply Tracking API router.
Supports supply tracking, cargo categories (Medicine, Food, Fuel, etc.),
priority scores, and reroute trigger status.
"""

from fastapi import APIRouter, HTTPException
from backend.app.services.data_store import store

router = APIRouter(prefix="/api/shipments", tags=["Shipments"])

@router.get("")
def list_shipments():
    """List all scheduled and active consignments sorted by priority."""
    ships = store.get_shipments()
    return sorted(ships, key=lambda s: s.get("priority", 0), reverse=True)

@router.get("/{shipment_id}")
def get_shipment(shipment_id: str):
    for s in store.shipments:
        if s["id"] == shipment_id:
            return s
    raise HTTPException(status_code=404, detail="Shipment not found")
