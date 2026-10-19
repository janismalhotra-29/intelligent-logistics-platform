"""
Roads API router for the NER Logistics Intelligence Platform.
Serves road network GIS data, state filters, segment inspectors,
and Explainable AI intelligence panels.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from backend.app.services.data_store import store 

router = APIRouter(prefix="/api/roads", tags=["Roads"])


@router.get("")
def list_roads(
    state: Optional[str] = None,
    limit: Optional[int] = Query(default=None, ge=1, le=500),
    offset: int = Query(default=0, ge=0)
):
    """List all roads or filter by state across all 8 NER states with optional pagination."""
    results = store.get_roads(state_filter=state)
    if limit is not None:
        return results[offset : offset + limit]
    return results


@router.get("/hubs")
def list_hubs():
    """List all major logistics depots and forward supply hubs."""
    return store.hubs


@router.get("/{road_id}")
def get_road(road_id: str):
    road = store.get_road_by_id(road_id)
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")
    return road


@router.get("/{road_id}/intelligence")
def get_road_intelligence(road_id: str):
    """
    Detailed intelligence panel for a road segment (Prompt Section 5).
    Returns AI risk, rainfall 1h/6h/24h/7d, slope, elevation, confidence,
    predicted accessibility disruption window, and alternative bypass.
    """
    intel = store.get_road_intelligence(road_id)
    if not intel:
        raise HTTPException(status_code=404, detail="Road intelligence not found")
    return intel
