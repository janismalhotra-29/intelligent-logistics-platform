"""
Unit and API tests for Health Check, Configuration, and Environment Sanitization.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config import Settings


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("HEALTHY", "DEGRADED")
    assert "NER Smart Logistics" in data["service"]
    assert data["database_status"] == "OPERATIONAL"
    assert data["ml_engine"] == "LOADED"
    assert "password" not in data["database"].lower()
    assert "***" in data["database"] or "SQLite" in data["database"]


def test_config_safe_db_summary():
    s = Settings(DATABASE_URL="postgresql://ner_admin:super_secret_password_123@db.example.com:5432/ner_db")
    summary = s.get_safe_db_summary()
    assert "super_secret_password_123" not in summary
    assert "postgresql://***:***@db.example.com:5432/ner_db" == summary


def test_config_allowed_origins_parsing():
    s = Settings(FRONTEND_ORIGINS_RAW="https://ner.vercel.app, http://localhost:3000 , ")
    origins = s.get_allowed_origins()
    assert len(origins) == 2
    assert "https://ner.vercel.app" in origins
    assert "http://localhost:3000" in origins
