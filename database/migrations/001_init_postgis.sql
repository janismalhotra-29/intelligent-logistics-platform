-- ============================================================================
-- NER SMART LOGISTICS AND ACCESSIBILITY INTELLIGENCE PLATFORM
-- Database Migration 001: PostgreSQL + PostGIS Spatial Schema
-- Covers all 8 North Eastern States:
-- Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura
-- ============================================================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. States table
CREATE TABLE IF NOT EXISTS states (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    capital VARCHAR(100) NOT NULL,
    boundary GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Districts table
CREATE TABLE IF NOT EXISTS districts (
    id VARCHAR(20) PRIMARY KEY,
    state_id VARCHAR(10) REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    headquarters VARCHAR(100),
    geom GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users and Role-Based Access Control
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('COMMAND_CENTER', 'LOGISTICS_OPERATOR', 'FIELD_OFFICER', 'ADMIN')),
    state_id VARCHAR(10) REFERENCES states(id),
    department VARCHAR(100),
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Logistics Hubs & Forward Supply Bases
CREATE TABLE IF NOT EXISTS hubs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    state_id VARCHAR(10) REFERENCES states(id),
    district VARCHAR(100),
    hub_type VARCHAR(80) NOT NULL,
    capacity_tons NUMERIC(10, 2) DEFAULT 500.0,
    geom GEOMETRY(Point, 4326) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Roads Master
CREATE TABLE IF NOT EXISTS roads (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    highway_no VARCHAR(50),
    state_id VARCHAR(10) REFERENCES states(id),
    from_hub_id VARCHAR(50) REFERENCES hubs(id),
    to_hub_id VARCHAR(50) REFERENCES hubs(id),
    total_length_km NUMERIC(8, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'ACCESSIBLE' CHECK (status IN ('ACCESSIBLE', 'WATCH', 'RESTRICTED', 'BLOCKED')),
    road_type VARCHAR(60) NOT NULL,
    road_surface VARCHAR(60) NOT NULL,
    road_condition_score INT CHECK (road_condition_score BETWEEN 1 AND 5),
    geom GEOMETRY(LineString, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Road Segments (Fine-grained topography & risk modeling)
CREATE TABLE IF NOT EXISTS road_segments (
    id VARCHAR(60) PRIMARY KEY,
    road_id VARCHAR(50) REFERENCES roads(id) ON DELETE CASCADE,
    segment_order INT NOT NULL,
    start_km NUMERIC(8, 2) NOT NULL,
    end_km NUMERIC(8, 2) NOT NULL,
    elevation_m NUMERIC(7, 2),
    slope_deg NUMERIC(5, 2),
    river_proximity_m NUMERIC(8, 2),
    historical_landslides INT DEFAULT 0,
    historical_floods INT DEFAULT 0,
    historical_incidents INT DEFAULT 0,
    current_status VARCHAR(30) DEFAULT 'ACCESSIBLE',
    risk_score INT DEFAULT 15,
    geom GEOMETRY(LineString, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bridges
CREATE TABLE IF NOT EXISTS bridges (
    id VARCHAR(50) PRIMARY KEY,
    road_id VARCHAR(50) REFERENCES roads(id),
    name VARCHAR(150) NOT NULL,
    river_name VARCHAR(100),
    bridge_type VARCHAR(60),
    condition_score INT CHECK (condition_score BETWEEN 1 AND 5),
    load_capacity_tons NUMERIC(6, 1),
    geom GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Weather & Rainfall Stations
CREATE TABLE IF NOT EXISTS weather (
    id VARCHAR(50) PRIMARY KEY,
    station_name VARCHAR(150) NOT NULL,
    state_id VARCHAR(10) REFERENCES states(id),
    geom GEOMETRY(Point, 4326) NOT NULL,
    current_rainfall_mm NUMERIC(6, 2) DEFAULT 0,
    rainfall_1h_mm NUMERIC(6, 2) DEFAULT 0,
    rainfall_6h_mm NUMERIC(6, 2) DEFAULT 0,
    rainfall_24h_mm NUMERIC(6, 2) DEFAULT 0,
    rainfall_7d_mm NUMERIC(7, 2) DEFAULT 0,
    forecast_rainfall_mm NUMERIC(6, 2) DEFAULT 0,
    temperature_c NUMERIC(5, 2),
    humidity_percent NUMERIC(5, 2),
    wind_speed_kmh NUMERIC(5, 2),
    visibility_km NUMERIC(5, 2),
    warning_level VARCHAR(30) DEFAULT 'NORMAL',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Vehicles Fleet
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(80) NOT NULL,
    driver_name VARCHAR(120),
    driver_contact VARCHAR(30),
    current_lat NUMERIC(9, 6) NOT NULL,
    current_lng NUMERIC(9, 6) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    current_speed_kmh NUMERIC(6, 2) DEFAULT 0,
    heading_deg NUMERIC(5, 2) DEFAULT 0,
    status VARCHAR(40) DEFAULT 'IDLE' CHECK (status IN ('IDLE', 'EN_ROUTE', 'DIVERTED', 'STOPPED', 'MAINTENANCE')),
    assigned_road_id VARCHAR(50) REFERENCES roads(id),
    is_diverted BOOLEAN DEFAULT FALSE,
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Fleet GPS Tracks / Telemetry History
CREATE TABLE IF NOT EXISTS gps_tracks (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE CASCADE,
    geom GEOMETRY(Point, 4326) NOT NULL,
    speed_kmh NUMERIC(6, 2),
    heading_deg NUMERIC(5, 2),
    elevation_m NUMERIC(7, 2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Shipments & Critical Cargo
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(50) PRIMARY KEY,
    cargo_name VARCHAR(150) NOT NULL,
    cargo_category VARCHAR(60) NOT NULL CHECK (cargo_category IN ('Medicine', 'Emergency supplies', 'Food', 'Fuel', 'Agricultural produce', 'Construction material')),
    priority INT NOT NULL CHECK (priority BETWEEN 1 AND 100),
    quantity VARCHAR(100) NOT NULL,
    origin_hub_id VARCHAR(50) REFERENCES hubs(id),
    dest_hub_id VARCHAR(50) REFERENCES hubs(id),
    vehicle_id VARCHAR(50) REFERENCES vehicles(id),
    status VARCHAR(40) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_TRANSIT', 'DIVERTED', 'DELIVERED', 'DELAYED')),
    departure_time TIMESTAMP WITH TIME ZONE,
    expected_arrival TIMESTAMP WITH TIME ZONE,
    predicted_arrival TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Incidents & Disaster Reports
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(50) PRIMARY KEY,
    road_id VARCHAR(50) REFERENCES roads(id),
    incident_type VARCHAR(60) NOT NULL CHECK (incident_type IN ('Landslide', 'Flood', 'Road Damage', 'Bridge Damage', 'Traffic', 'Other')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(40) DEFAULT 'ACTIVE_VERIFIED',
    geom GEOMETRY(Point, 4326) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    description TEXT,
    reported_by VARCHAR(150),
    photo_url VARCHAR(255),
    cv_classification JSONB,
    affected_vehicles_count INT DEFAULT 0,
    affected_shipments_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Field Reports (Offline sync compatible)
CREATE TABLE IF NOT EXISTS field_reports (
    id VARCHAR(60) PRIMARY KEY,
    client_uuid VARCHAR(60) UNIQUE NOT NULL,
    officer_id VARCHAR(36) REFERENCES users(id),
    incident_type VARCHAR(60) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    description TEXT,
    photo_url VARCHAR(255),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_offline_submission BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 14. AI Risk Predictions
CREATE TABLE IF NOT EXISTS risk_predictions (
    id BIGSERIAL PRIMARY KEY,
    road_id VARCHAR(50) REFERENCES roads(id),
    risk_score INT NOT NULL,
    flood_risk INT NOT NULL,
    landslide_risk INT NOT NULL,
    heavy_rain_risk INT NOT NULL,
    traffic_risk INT NOT NULL,
    overall_level VARCHAR(30) NOT NULL,
    disruption_window VARCHAR(50) NOT NULL,
    contributors JSONB,
    predicted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Actionable Alerts & Decisions
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(50) PRIMARY KEY,
    alert_level VARCHAR(30) NOT NULL CHECK (alert_level IN ('NORMAL', 'WATCH', 'WARNING', 'CRITICAL')),
    title VARCHAR(255) NOT NULL,
    road_id VARCHAR(50) REFERENCES roads(id),
    risk_score INT NOT NULL,
    reason TEXT NOT NULL,
    prediction TEXT NOT NULL,
    affected_vehicles INT DEFAULT 0,
    critical_shipments INT DEFAULT 0,
    recommended_action TEXT NOT NULL,
    alternative_route_id VARCHAR(50) REFERENCES roads(id),
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SPATIAL INDEXES (GIST) FOR ULTRA-FAST GEOGRAPHIC QUERIES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_roads_geom ON roads USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_road_segments_geom ON road_segments USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_hubs_geom ON hubs USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_bridges_geom ON bridges USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_weather_geom ON weather USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_vehicles_geom ON vehicles USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_gps_tracks_geom ON gps_tracks USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_incidents_geom ON incidents USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_field_reports_geom ON field_reports USING GIST(geom);

-- B-Tree indexes for relational queries
CREATE INDEX IF NOT EXISTS idx_roads_status ON roads(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_shipments_priority ON shipments(priority DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_level ON alerts(alert_level);
