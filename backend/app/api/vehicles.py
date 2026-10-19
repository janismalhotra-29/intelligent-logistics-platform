"""
Vehicles Fleet and Live GPS Tracking API router.
Supports fleet queries, vehicle intelligence inspectors, simulation ticks along routes,
and dynamic diversion execution with role-based authorization.
"""

import random
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel, Field
from backend.app.services.data_store import store
from backend.app.auth import require_operator_or_officer

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])


class DivertRequest(BaseModel):
    new_road_id: Optional[str] = Field(default="R-1028", max_length=60)
    reason: Optional[str] = Field(
        default="Immediate avoidance of high-risk / blocked sector",
        max_length=500
    )


@router.get("")
def list_vehicles(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0)
):
    """List active vehicle fleet with real-time GPS telemetry and cargo status."""
    all_vehicles = store.get_vehicles()
    return all_vehicles[offset : offset + limit]


@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: str):
    for v in store.vehicles:
        if v["id"] == vehicle_id:
            return v
    raise HTTPException(status_code=404, detail="Vehicle not found")


@router.post("/{vehicle_id}/divert")
def divert_vehicle(
    vehicle_id: str, 
    payload: DivertRequest,
    auth: dict = Depends(require_operator_or_officer)
):
    """Execute dynamic route diversion for a vehicle convoy (requires Operator or Command Center role)."""
    v = store.divert_vehicle(vehicle_id, payload.new_road_id)
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"status": "SUCCESS", "vehicle": v, "diverted_to": payload.new_road_id}


@router.post("/simulate-tick")
def simulate_vehicle_movement():
    """
    Simulation mode tick: nudge vehicle GPS positions slightly along their roads
    to demonstrate live telematics and moving fleet markers on the GIS map.
    """
    for v in store.vehicles:
        if v.get("status") in ["EN_ROUTE", "DIVERTED"]:
            # Micro nudge coordinates within reasonable speed bounds
            v["current_lat"] += random.uniform(-0.0012, 0.0012)
            v["current_lng"] += random.uniform(-0.0012, 0.0012)
            v["current_speed_kmh"] = max(18.0, min(65.0, v["current_speed_kmh"] + random.uniform(-2.0, 2.0)))
    return {"status": "SUCCESS", "vehicles": store.vehicles}
