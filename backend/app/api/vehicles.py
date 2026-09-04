"""
Vehicles Fleet and Live GPS Tracking API router.
Supports fleet queries, vehicle intelligence inspectors, simulation ticks along routes,
and instant diversion triggers.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.services.data_store import store

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])

class DivertRequest(BaseModel):
    new_road_id: Optional[str] = "R-1028"
    reason: Optional[str] = "Immediate avoidance of high-risk / blocked sector"

@router.get("")
def list_vehicles():
    """List active vehicle fleet with real-time GPS telemetry and cargo status."""
    return store.get_vehicles()

@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: str):
    for v in store.vehicles:
        if v["id"] == vehicle_id:
            return v
    raise HTTPException(status_code=404, detail="Vehicle not found")

@router.post("/{vehicle_id}/divert")
def divert_vehicle(vehicle_id: str, payload: DivertRequest):
    """Execute dynamic route diversion for a vehicle convoy."""
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
    import random
    for v in store.vehicles:
        if v.get("status") in ["EN_ROUTE", "DIVERTED"]:
            # Micro nudge coordinates
            v["current_lat"] += random.uniform(-0.0015, 0.0015)
            v["current_lng"] += random.uniform(-0.0015, 0.0015)
            v["current_speed_kmh"] = max(18.0, min(65.0, v["current_speed_kmh"] + random.uniform(-2.0, 2.0)))
    return {"status": "SUCCESS", "vehicles": store.vehicles}
