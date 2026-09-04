"""
Weather and Precipitation Telemetry API router.
Serves real-time rainfall, 1h/6h/24h/7d accumulation, forecasts,
and meteorological warning states across all 8 NER states.
"""

from typing import Optional
from fastapi import APIRouter
from backend.app.services.data_store import store
from backend.app.services.live_weather_service import live_weather_service

router = APIRouter(prefix="/api/weather", tags=["Weather"])

@router.get("")
def list_weather_stations(state: Optional[str] = None, refresh: bool = False):
    """List live real-time weather observatory readings across the North Eastern Region."""
    # Fetch live weather (cached with TTL)
    live_stations = live_weather_service.get_live_weather(force_refresh=refresh)
    if live_stations:
        store.weather = live_stations

    weather_list = store.weather
    if state and state.lower() != "all":
        return [w for w in weather_list if w.get("state", "").lower() == state.lower()]
    return weather_list

@router.post("/sync")
def sync_live_weather():
    """Force an immediate live meteorological sync from Open-Meteo API."""
    live_stations = live_weather_service.get_live_weather(force_refresh=True)
    if live_stations:
        store.weather = live_stations
    return {
        "status": "success",
        "synced_stations": len(live_stations),
        "source": "Open-Meteo Real-Time Met Feed",
        "data": live_stations
    }
