"""
Routing Engine and Multi-Criteria Hazard Tests.
Verifies normal route calculation, blocked corridor detour bypasses,
disconnected graph handling, and cargo priority weighting.
"""

import pytest
from backend.app.routing.hazard_router import optimize_route, calculate_segment_penalty
from backend.app.services.data_store import DataStore


@pytest.fixture
def store():
    return DataStore()


def test_routing_normal_route(store):
    roads_accessible = [dict(r) for r in store.roads]
    for r in roads_accessible:
        if r["id"] == "R-1024":
            r["status"] = "ACCESSIBLE"

    res = optimize_route(roads_accessible, store.hubs, "Gangtok", "Mangan", "Medicine", 100)
    assert res["route_found"] is True
    assert res["recommended_route"]["route_id"] == "ROUTE-A"
    assert res["recommended_route"]["is_traversable"] is True


def test_routing_blocked_road_detour(store):
    roads_blocked = [dict(r) for r in store.roads]
    for r in roads_blocked:
        if r["id"] == "R-1024":
            r["status"] = "BLOCKED"

    res = optimize_route(roads_blocked, store.hubs, "Gangtok", "Mangan", "Medicine", 100)
    assert res["route_found"] is True
    # Route B (Dikchu Western Bypass) should be recommended
    assert res["recommended_route"]["route_id"] == "ROUTE-B"
    assert res["recommended_route"]["is_traversable"] is True
    
    # Blocked route A should be listed with BLOCKED status and not recommended
    route_a = next(r for r in res["all_routes"] if r["route_id"] == "ROUTE-A")
    assert route_a["status"] == "BLOCKED"
    assert route_a["is_traversable"] is False
    assert route_a["is_recommended"] is False


def test_routing_disconnected_network(store):
    # Empty roads: no network path exists
    res = optimize_route([], store.hubs, "Guwahati", "Silchar", "Food", 80)
    assert res["route_found"] is False
    assert res["status"] == "NO_SAFE_ROUTE"
    assert res["recommended_route"] is None
    assert "No traversable corridors" in res["message"]


def test_routing_unknown_hub(store):
    res = optimize_route(store.roads, store.hubs, "NonExistentCity", "Mangan", "Medicine", 100)
    assert res["route_found"] is False
    assert "Hub not found" in res["error"]


def test_segment_penalty_priority_weighting():
    risky_segment = {
        "id": "TEST-RISK-1",
        "distance_km": 50.0,
        "base_speed_kmh": 35.0,
        "slope_deg": 35.0,
        "elevation_m": 1200.0,
        "road_condition_score": 2,
        "traffic_level": "High",
        "historical_landslides": 4,
        "historical_floods": 1,
        "status": "WATCH"
    }

    # Higher cargo priority (Medicine = 100) should produce higher penalty than lower priority (Construction = 40)
    penalty_high_priority = calculate_segment_penalty(risky_segment, cargo_priority=100)
    penalty_low_priority = calculate_segment_penalty(risky_segment, cargo_priority=40)
    assert penalty_high_priority > penalty_low_priority


def test_blocked_segment_penalty_infinite():
    blocked_segment = {
        "id": "TEST-BLOCKED-1",
        "distance_km": 50.0,
        "status": "BLOCKED"
    }
    cost = calculate_segment_penalty(blocked_segment, allow_blocked=False)
    assert cost == float("inf")
