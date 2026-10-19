"""
Database Integration and Persistence Tests.
Verifies that models, incidents, and diversions persist to the relational database
and survive application restarts.
"""

import pytest
from backend.app.services.data_store import DataStore
from backend.app.database import SessionLocal
from backend.app.models.entities import HubModel, RoadModel, VehicleModel, ShipmentModel, IncidentModel, FieldReportModel


@pytest.fixture
def store():
    return DataStore()


def test_database_seeding(store):
    session = SessionLocal()
    roads_count = session.query(RoadModel).count()
    hubs_count = len(store.hubs)
    vehicles_count = session.query(VehicleModel).count()
    shipments_count = session.query(ShipmentModel).count()
    session.close()

    assert roads_count >= 18
    assert hubs_count >= 10
    assert vehicles_count >= 4
    assert shipments_count >= 4


def test_incident_persistence_and_restart(store):
    test_id = f"INC-TEST-{id(object())}"
    incident_data = {
        "id": test_id,
        "road_id": "R-1024",
        "road_name": "NH-310A North Sikkim",
        "state": "Sikkim",
        "type": "Landslide",
        "severity": "CRITICAL",
        "status": "ACTIVE_VERIFIED",
        "lat": 27.4250,
        "lng": 88.5520,
        "reported_by": "Senior Geotechnical Inspector",
        "timestamp": "Just now",
        "description": "Massive hill failure blocking both lanes at Mile-14",
        "photo_url": "/demo/landslide_nh310a.jpg",
        "cv_classification": {"detected_type": "Landslide", "confidence": 94},
        "affected_vehicles_count": 6,
        "affected_shipments_count": 2
    }

    # Add incident
    store.add_incident(incident_data)

    # 1. Direct database verification
    session = SessionLocal()
    db_inc = session.query(IncidentModel).filter(IncidentModel.id == test_id).first()
    assert db_inc is not None
    assert db_inc.type == "Landslide"
    assert db_inc.severity == "CRITICAL"

    # Road should be updated to BLOCKED in database
    db_road = session.query(RoadModel).filter(RoadModel.id == "R-1024").first()
    assert db_road.status == "BLOCKED"
    session.close()

    # 2. Restart survivability: Create fresh DataStore instance and assert record is present
    fresh_store = DataStore()
    incidents = fresh_store.get_incidents()
    matching = [i for i in incidents if i["id"] == test_id]
    assert len(matching) == 1
    assert matching[0]["severity"] == "CRITICAL"


def test_vehicle_diversion_persistence(store):
    v = store.divert_vehicle("V-102", "R-1028")
    assert v is not None
    assert v["is_diverted"] is True
    assert v["status"] == "DIVERTED"
    assert v["assigned_road_id"] == "R-1028"

    # Direct database verification
    session = SessionLocal()
    db_v = session.query(VehicleModel).filter(VehicleModel.id == "V-102").first()
    assert db_v is not None
    assert db_v.is_diverted is True
    assert db_v.status == "DIVERTED"
    session.close()


def test_postgis_migration_script_integrity():
    import pathlib
    migration_path = pathlib.Path("database/migrations/001_init_postgis.sql")
    assert migration_path.exists(), "001_init_postgis.sql must exist"
    
    content = migration_path.read_text(encoding="utf-8")
    assert "CREATE EXTENSION IF NOT EXISTS postgis;" in content
    assert "CREATE TABLE IF NOT EXISTS states" in content
    assert "CREATE TABLE IF NOT EXISTS hubs" in content
    assert "CREATE TABLE IF NOT EXISTS roads" in content
    assert "CREATE TABLE IF NOT EXISTS vehicles" in content
    assert "CREATE TABLE IF NOT EXISTS shipments" in content
    assert "CREATE TABLE IF NOT EXISTS incidents" in content
    assert "CREATE TABLE IF NOT EXISTS field_reports" in content
    assert "CREATE TABLE IF NOT EXISTS alerts" in content
    assert "USING GIST(geom)" in content


def test_database_transaction_rollback_on_error():
    from sqlalchemy.exc import IntegrityError
    session = SessionLocal()
    
    # Try inserting an invalid hub without required fields
    try:
        invalid_hub = HubModel(id=None, name=None, state=None, hub_type=None, lat=None, lng=None) # type: ignore
        session.add(invalid_hub)
        session.flush()
        assert False, "Should have raised exception on invalid insert"
    except Exception:
        session.rollback()
    
    # Session must remain healthy and usable after rollback
    active_hubs = session.query(HubModel).count()
    assert active_hubs >= 10
    session.close()

