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


def test_api_weather_endpoints(client):
    res = client.get("/api/weather")
    assert res.status_code == 200
    stations = res.json()
    assert len(stations) >= 8
    assert any(s["state"] == "Assam" for s in stations)
    assert any(s["state"] == "Meghalaya" for s in stations)

    # Filter by state
    res_sikkim = client.get("/api/weather?state=Sikkim")
    assert res_sikkim.status_code == 200
    assert all(s["state"] == "Sikkim" for s in res_sikkim.json())


def test_api_route_optimization(client):
    payload = {
        "origin": "Gangtok",
        "destination": "Mangan",
        "cargo_category": "Medicine",
        "cargo_priority": 100
    }
    res = client.post("/api/routes/optimize", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["route_found"] is True
    assert "recommended_route" in data
    assert "all_routes" in data


def test_api_ai_prediction_endpoints(client):
    # Risk prediction direct endpoint
    risk_payload = {
        "rainfall_24h": 85.0,
        "slope": 28.0,
        "elevation": 1400.0,
        "road_condition_score": 3,
        "historical_landslides": 2
    }
    res_risk = client.post("/api/risk/predict", json=risk_payload)
    assert res_risk.status_code == 200
    risk_data = res_risk.json()
    assert "risk_score" in risk_data
    assert "overall_level" in risk_data
    assert "contributors" in risk_data
    assert risk_data["is_synthetic_prototype"] is True

    # ETA prediction direct endpoint
    eta_payload = {
        "distance_km": 80.0,
        "base_speed_kmh": 35.0,
        "road_condition_score": 3,
        "route_risk_score": 40
    }
    res_eta = client.post("/api/eta/predict", json=eta_payload)
    assert res_eta.status_code == 200
    eta_data = res_eta.json()
    assert "predicted_delay_minutes" in eta_data
    assert "estimated_variation_range" in eta_data
    assert eta_data["is_synthetic_prototype"] is True


def test_live_weather_service_tls_context():
    from backend.app.services.live_weather_service import LiveWeatherService
    svc = LiveWeatherService()
    # Verify standard TLS certificate validation is enabled
    assert svc._ssl_context.verify_mode != 0  # ssl.CERT_REQUIRED
    assert svc._ssl_context.check_hostname is True

    # Test safe fallback tagging when station is unreachable
    fake_station = {
        "station_id": "W-TEST-OFFLINE",
        "name": "Offline Mount Station",
        "state": "Sikkim",
        "lat": 999.0,  # Invalid latitude will trigger error safely
        "lng": 999.0,
        "elevation_m": 2000
    }
    fallback = svc._fetch_station_safe(fake_station)
    assert fallback["is_live"] is False
    assert "Unavailable" in fallback["source"]

