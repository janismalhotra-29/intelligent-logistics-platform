"""
Security and Input Validation Tests.
Covers file uploads, MIME validation, size limits, input bounds, and duplicate replay suppression.
"""

import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def create_dummy_image_bytes(format="JPEG", size=(64, 64), color=(120, 80, 50)):
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format)
    return buf.getvalue()


def test_classify_photo_unsupported_mime(client):
    res = client.post(
        "/api/incidents/classify-photo",
        files={"file": ("malicious.exe", b"MZ\x90\x00\x03\x00\x00\x00", "application/x-msdownload")}
    )
    assert res.status_code == 415
    assert "Unsupported file type" in res.json()["detail"]


def test_classify_photo_empty_file(client):
    res = client.post(
        "/api/incidents/classify-photo",
        files={"file": ("empty.jpg", b"", "image/jpeg")}
    )
    assert res.status_code == 400


def test_classify_photo_corrupt_image(client):
    res = client.post(
        "/api/incidents/classify-photo",
        files={"file": ("corrupt.jpg", b"GIF89a NOT AN IMAGE PAYLOAD", "image/jpeg")}
    )
    assert res.status_code == 400
    assert "Invalid or corrupt image" in res.json()["detail"]


def test_classify_photo_valid_image(client):
    img_bytes = create_dummy_image_bytes(format="JPEG")
    res = client.post(
        "/api/incidents/classify-photo",
        files={"file": ("terrain.jpg", img_bytes, "image/jpeg")}
    )
    assert res.status_code == 200
    data = res.json()
    assert "predicted_type" in data
    assert "confidence_percentage" in data
    assert data["is_simulation"] is False
    assert "heuristic_signals" in data


def test_classify_photo_simulation_mode(client):
    res = client.post(
        "/api/incidents/classify-photo",
        data={"simulated_type": "Flood"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_type"] == "Flood"
    assert data["is_simulation"] is True


def test_field_reports_sync_and_deduplication(client):
    unique_id = f"TEST-UUID-{id(object())}"
    report = {
        "client_uuid": unique_id,
        "road_id": "R-1024",
        "road_name": "NH-310A North Sikkim",
        "state": "Sikkim",
        "incident_type": "Landslide",
        "severity": "HIGH",
        "latitude": 27.4250,
        "longitude": 88.5520,
        "description": "Ground verification patrol report",
        "officer_name": "Patrol Officer",
        "timestamp_captured": "2026-10-19T10:00:00Z",
        "photo_url": "/demo/landslide_nh310a.jpg",
        "cv_classification": {}
    }

    # First sync: Accepted
    res1 = client.post("/api/field-reports/sync", json={"reports": [report]})
    assert res1.status_code == 200
    assert res1.json()["synced_count"] == 1
    assert res1.json()["duplicates_skipped"] == 0

    # Duplicate replay: Duplicate skipped
    res2 = client.post("/api/field-reports/sync", json={"reports": [report]})
    assert res2.status_code == 200
    assert res2.json()["synced_count"] == 0
    assert res2.json()["duplicates_skipped"] == 1


def test_field_reports_out_of_bounds_coordinates(client):
    bad_report = {
        "client_uuid": f"BAD-COORD-{id(object())}",
        "road_id": "R-1024",
        "road_name": "NH-310A",
        "state": "Sikkim",
        "incident_type": "Landslide",
        "severity": "HIGH",
        "latitude": 5.0,  # Far outside NER region (20..32)
        "longitude": 88.5520,
        "description": "Out of bounds",
        "officer_name": "Patrol Officer",
        "timestamp_captured": "2026-10-19T10:00:00Z"
    }
    res = client.post("/api/field-reports/sync", json={"reports": [bad_report]})
    assert res.status_code == 422


def test_scenario_step_validation(client):
    # Valid step 1..4
    res_valid = client.post("/api/scenario/step", json={"step": 2, "vehicle_id": "V-102"})
    assert res_valid.status_code == 200
    assert res_valid.json()["step"] == 2

    # Invalid step outside 1..4
    res_invalid = client.post("/api/scenario/step", json={"step": 10, "vehicle_id": "V-102"})
    assert res_invalid.status_code == 422
