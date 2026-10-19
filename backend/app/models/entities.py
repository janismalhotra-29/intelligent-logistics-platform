"""
SQLAlchemy ORM Entities representing the core NER Smart Logistics domain schema.
Matches the tables in database/migrations/001_init_postgis.sql with JSON and cross-platform compatibility.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime, JSON, ForeignKey
)
from backend.app.database import Base


class HubModel(Base):
    __tablename__ = "hubs"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    state = Column(String(50), nullable=False, index=True)
    district = Column(String(100), nullable=True)
    hub_type = Column(String(80), nullable=False)
    capacity_tons = Column(Float, default=500.0)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class RoadModel(Base):
    __tablename__ = "roads"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    highway_no = Column(String(50), nullable=True)
    state = Column(String(50), nullable=False, index=True)
    from_hub = Column(String(50), nullable=True)
    to_hub = Column(String(50), nullable=True)
    distance_km = Column(Float, nullable=False)
    status = Column(String(30), default="ACCESSIBLE", index=True)  # ACCESSIBLE, WATCH, RESTRICTED, BLOCKED
    base_speed_kmh = Column(Float, default=35.0)
    elevation_m = Column(Float, default=1000.0)
    slope_deg = Column(Float, default=20.0)
    road_type = Column(String(60), default="National Highway")
    road_surface = Column(String(60), default="Asphalt")
    road_condition_score = Column(Integer, default=3)
    traffic_level = Column(String(30), default="Moderate")
    river_proximity_m = Column(Float, default=300.0)
    historical_landslides = Column(Integer, default=0)
    historical_floods = Column(Integer, default=0)
    bridge_condition_score = Column(Integer, default=4)
    coordinates = Column(JSON, default=list)
    alternative_route_ids = Column(JSON, default=list)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class VehicleModel(Base):
    __tablename__ = "vehicles"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    vehicle_type = Column(String(80), nullable=False)
    driver_name = Column(String(120), nullable=True)
    driver_contact = Column(String(30), nullable=True)
    current_lat = Column(Float, nullable=False)
    current_lng = Column(Float, nullable=False)
    current_speed_kmh = Column(Float, default=0.0)
    heading_deg = Column(Float, default=0.0)
    status = Column(String(40), default="IDLE", index=True)  # IDLE, EN_ROUTE, DIVERTED, STOPPED
    assigned_road_id = Column(String(50), nullable=True)
    origin = Column(String(50), nullable=True)
    destination = Column(String(50), nullable=True)
    cargo_id = Column(String(50), nullable=True)
    cargo_name = Column(String(150), nullable=True)
    cargo_priority = Column(Integer, default=80)
    is_diverted = Column(Boolean, default=False)
    current_route_risk = Column(String(30), default="LOW")
    predicted_delay = Column(String(30), default="+0 min")
    last_ping = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ShipmentModel(Base):
    __tablename__ = "shipments"

    id = Column(String(50), primary_key=True, index=True)
    cargo_name = Column(String(150), nullable=False)
    cargo_category = Column(String(60), nullable=False, index=True)
    priority = Column(Integer, nullable=False, index=True)
    quantity = Column(String(100), nullable=False)
    origin_hub = Column(String(100), nullable=True)
    dest_hub = Column(String(100), nullable=True)
    vehicle_id = Column(String(50), nullable=True)
    status = Column(String(40), default="SCHEDULED", index=True)  # SCHEDULED, IN_TRANSIT, DIVERTED, DELIVERED, DELAYED
    risk_impact = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class IncidentModel(Base):
    __tablename__ = "incidents"

    id = Column(String(60), primary_key=True, index=True)
    road_id = Column(String(50), nullable=True, index=True)
    road_name = Column(String(200), nullable=True)
    state = Column(String(50), nullable=True, index=True)
    type = Column(String(60), nullable=False, index=True)  # Landslide, Flood, Road Damage, Bridge Damage, Traffic
    severity = Column(String(20), nullable=False, index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(40), default="ACTIVE_VERIFIED")
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    reported_by = Column(String(150), nullable=True)
    timestamp = Column(String(60), nullable=True)
    description = Column(Text, nullable=True)
    photo_url = Column(String(255), nullable=True)
    cv_classification = Column(JSON, nullable=True)
    affected_vehicles_count = Column(Integer, default=0)
    affected_shipments_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class FieldReportModel(Base):
    __tablename__ = "field_reports"

    id = Column(String(60), primary_key=True, index=True)
    client_uuid = Column(String(64), unique=True, nullable=False, index=True)
    road_id = Column(String(60), nullable=True)
    road_name = Column(String(200), nullable=True)
    state = Column(String(100), nullable=True)
    incident_type = Column(String(60), nullable=False)
    severity = Column(String(20), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    officer_name = Column(String(150), nullable=True)
    timestamp_captured = Column(String(60), nullable=True)
    photo_url = Column(String(500), nullable=True)
    cv_classification = Column(JSON, nullable=True)
    synced_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AlertModel(Base):
    __tablename__ = "alerts"

    id = Column(String(60), primary_key=True, index=True)
    alert_level = Column(String(30), nullable=False, index=True)  # NORMAL, WATCH, WARNING, CRITICAL
    icon = Column(String(10), default="⚠️")
    title = Column(String(255), nullable=False)
    road_id = Column(String(50), nullable=True, index=True)
    route_name = Column(String(200), nullable=True)
    state = Column(String(50), nullable=True)
    risk_score = Column(Integer, nullable=False)
    reason = Column(Text, nullable=False)
    prediction = Column(Text, nullable=False)
    disruption_window = Column(String(50), default="Low probability")
    affected_vehicles = Column(Integer, default=0)
    critical_shipments = Column(Integer, default=0)
    recommended_action = Column(Text, nullable=False)
    alternative_route_id = Column(String(50), nullable=True)
    alternative_route_name = Column(String(255), nullable=True)
    status = Column(String(30), default="ACTIVE")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
