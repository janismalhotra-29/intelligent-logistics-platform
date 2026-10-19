"""
Comprehensive API Router Integration Tests.
Tests roads, hubs, intelligence, shipments, vehicles, alerts, and dashboard endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_api_list_roads(client):
    res = client.get("/api/roads")
    assert res.status_code == 200
    roads = res.json()
    assert len(roads) >= 18
    assert any(r["state"] == "Sikkim" for r in roads)
    assert any(r["state"] == "Assam" for r in roads)


def test_api_list_roads_state_filter(client):
    res = client.get("/api/roads?state=Sikkim")
    assert res.status_code == 200
    roads = res.json()
    assert all(r["state"] == "Sikkim" for r in roads)


def test_api_road_intelligence(client):
    res = client.get("/api/roads/R-1024/intelligence")
    assert res.status_code == 200
    data = res.json()
    assert "road" in data
    assert "risk_analysis" in data
    assert "accessibility" in data
    assert "eta_analysis" in data


def test_api_list_hubs(client):
    res = client.get("/api/roads/hubs")
    assert res.status_code == 200
    hubs = res.json()
    assert len(hubs) >= 10


def test_api_list_vehicles(client):
    res = client.get("/api/vehicles")
    assert res.status_code == 200
    vehicles = res.json()
    assert len(vehicles) >= 4


def test_api_vehicle_simulate_tick(client):
    res = client.post("/api/vehicles/simulate-tick")
    assert res.status_code == 200
    assert res.json()["status"] == "SUCCESS"


def test_api_list_shipments(client):
    res = client.get("/api/shipments")
    assert res.status_code == 200
    ships = res.json()
    assert len(ships) >= 4
    # Should be sorted by priority descending
    priorities = [s["priority"] for s in ships]
    assert priorities == sorted(priorities, reverse=True)


def test_api_dashboard_summary(client):
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    kpis = data["kpis"]
    assert kpis["total_roads_monitored"] >= 18
    assert "state_breakdown" in data
    assert "Sikkim" in data["state_breakdown"]


def test_api_list_alerts_and_resolve(client):
    res = client.get("/api/alerts")
    assert res.status_code == 200
    alerts = res.json()
    assert len(alerts) > 0
    first_id = alerts[0]["id"]

    res_resolve = client.post(f"/api/alerts/{first_id}/resolve")
    assert res_resolve.status_code == 200
    assert res_resolve.json()["alert"]["status"] == "RESOLVED"
