"""
Routes and Intelligent Optimization API router.
Serves Origin -> Destination route planning with multi-criteria dynamic hazard optimization,
priority-weighted cargo routing, and alternative comparisons with trade-off rationale.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from backend.app.services.data_store import store
from backend.app.routing.hazard_router import optimize_route

router = APIRouter(prefix="/api/routes", tags=["Routing"])

class RouteOptimizationRequest(BaseModel):
    origin: str = Field(default="Gangtok Medical Depot", description="Origin hub or city name")
    destination: str = Field(default="Mangan Forward Relief Base", description="Destination hub or city name")
    cargo_category: str = Field(default="Medicine", description="Cargo type (Medicine, Food, Emergency supplies, Fuel, Agricultural produce, Construction material)")
    cargo_priority: int = Field(default=100, description="Priority weight (50 to 100)")

@router.post("/optimize")
def optimize_trip_route(request: RouteOptimizationRequest):
    """
    Calculate dynamic hazard-aware optimal route and comparative alternatives.
    """
    result = optimize_route(
        roads=store.roads,
        hubs=store.hubs,
        origin_name=request.origin,
        dest_name=request.destination,
        cargo_category=request.cargo_category,
        cargo_priority=request.cargo_priority
    )
    return result
