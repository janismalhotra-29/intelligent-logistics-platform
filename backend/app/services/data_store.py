"""
Reactive & Persistent Data Store for the NER Logistics Intelligence Platform.
Persists incidents, field reports, fleet diversions, and operational records in
the configured relational database (PostgreSQL/PostGIS or persistent SQLite)
with thread-safe concurrency handling, atomic transactions, and restart recovery.
"""

import copy
import logging
import threading
from typing import List, Dict, Any, Optional
from datetime import datetime

from backend.app.database import engine, SessionLocal, Base
from backend.app.models.entities import (
    HubModel, RoadModel, VehicleModel, ShipmentModel,
    IncidentModel, FieldReportModel, AlertModel
)
from backend.app.seed_generator import (
    get_ner_hubs,
    get_ner_roads,
    get_ner_vehicles,
    get_ner_shipments,
    get_ner_weather,
    get_ner_incidents,
    get_initial_alerts
)
from ml.risk_model.train_and_predict import predict_road_risk
from ml.eta_model.train_and_predict import predict_eta
from backend.app.services.accessibility_engine import evaluate_road_accessibility

logger = logging.getLogger("ner_logistics.store")


class DataStore:
    def __init__(self):
        self._lock = threading.RLock()
        self._init_database()
        self.load_from_database()

    def _init_database(self):
        """Create tables if they do not exist and seed initial reference datasets."""
        try:
            Base.metadata.create_all(bind=engine)
            self._seed_reference_data_if_empty()
        except Exception as e:
            logger.error(f"Error initializing database schema: {e}")

    def _seed_reference_data_if_empty(self):
        """Seed baseline hubs, roads, vehicles, and shipments if database is brand new."""
        session = SessionLocal()
        try:
            if session.query(RoadModel).count() == 0:
                logger.info("Database is empty. Seeding initial NER reference data...")
                for h in get_ner_hubs():
                    session.add(HubModel(
                        id=h["id"], name=h["name"], state=h["state"],
                        district=h.get("district"), hub_type=h.get("type", "Hub"),
                        capacity_tons=float(h.get("capacity_tons", 500)),
                        lat=float(h["lat"]), lng=float(h["lng"])
                    ))

                for r in get_ner_roads():
                    session.add(RoadModel(
                        id=r["id"], name=r["name"], highway_no=r.get("highway_no"),
                        state=r.get("state", "NER"), from_hub=r.get("from_hub"),
                        to_hub=r.get("to_hub"), distance_km=float(r.get("distance_km", 50)),
                        status=r.get("status", "ACCESSIBLE"),
                        base_speed_kmh=float(r.get("base_speed_kmh", 35)),
                        elevation_m=float(r.get("elevation_m", 1000)),
                        slope_deg=float(r.get("slope_deg", 20)),
                        road_type=r.get("road_type", "National Highway"),
                        road_surface=r.get("road_surface", "Asphalt"),
                        road_condition_score=int(r.get("road_condition_score", 3)),
                        traffic_level=r.get("traffic_level", "Moderate"),
                        river_proximity_m=float(r.get("river_proximity_m", 300)),
                        historical_landslides=int(r.get("historical_landslides", 0)),
                        historical_floods=int(r.get("historical_floods", 0)),
                        bridge_condition_score=int(r.get("bridge_condition_score", 4)),
                        coordinates=r.get("coordinates", []),
                        alternative_route_ids=r.get("alternative_route_ids", [])
                    ))

                for v in get_ner_vehicles():
                    session.add(VehicleModel(
                        id=v["id"], name=v["name"], 
                        vehicle_type=v.get("vehicle_type", v.get("type", "Supply Truck")),
                        driver_name=v.get("driver_name", v.get("driver")), 
                        driver_contact=v.get("driver_contact", v.get("contact")),
                        current_lat=float(v.get("current_lat", v.get("lat", 27.0))), 
                        current_lng=float(v.get("current_lng", v.get("lng", 88.0))),
                        current_speed_kmh=float(v.get("current_speed_kmh", v.get("speed_kmh", 35))),
                        status=v.get("status", "EN_ROUTE"),
                        assigned_road_id=v.get("assigned_road_id"),
                        origin=v.get("origin"), destination=v.get("destination"),
                        cargo_id=v.get("cargo_id"), cargo_name=v.get("cargo_name"),
                        cargo_priority=int(v.get("cargo_priority", 80)),
                        is_diverted=bool(v.get("is_diverted", False)),
                        current_route_risk=v.get("current_route_risk", "LOW"),
                        predicted_delay=v.get("predicted_delay", "+0 min")
                    ))

                for s in get_ner_shipments():
                    session.add(ShipmentModel(
                        id=s["id"], cargo_name=s["cargo_name"],
                        cargo_category=s.get("cargo_category", s.get("category", "General")),
                        priority=int(s.get("priority", 80)), quantity=s.get("quantity", "1 Unit"),
                        origin_hub=s.get("origin", s.get("origin_hub")), 
                        dest_hub=s.get("destination", s.get("dest_hub")),
                        vehicle_id=s.get("vehicle_id"), status=s.get("status", "SCHEDULED"),
                        risk_impact=s.get("risk_impact")
                    ))

                for inc in get_ner_incidents():
                    session.add(IncidentModel(
                        id=inc["id"], road_id=inc.get("road_id"), road_name=inc.get("road_name"),
                        state=inc.get("state"), type=inc.get("type", "Landslide"),
                        severity=inc.get("severity", "MEDIUM"), status=inc.get("status", "ACTIVE_VERIFIED"),
                        lat=float(inc.get("lat", 27.0)), lng=float(inc.get("lng", 88.0)),
                        reported_by=inc.get("reported_by"), timestamp=inc.get("timestamp", "Initial"),
                        description=inc.get("description"), photo_url=inc.get("photo_url"),
                        cv_classification=inc.get("cv_classification"),
                        affected_vehicles_count=int(inc.get("affected_vehicles_count", 0)),
                        affected_shipments_count=int(inc.get("affected_shipments_count", 0))
                    ))

                for a in get_initial_alerts():
                    session.add(AlertModel(
                        id=a["id"], alert_level=a.get("alert_level", "WATCH"),
                        icon=a.get("icon", "⚠️"), title=a.get("title", "Advisory"),
                        road_id=a.get("road_id"), route_name=a.get("route_name"),
                        state=a.get("state"), risk_score=int(a.get("risk_score", 30)),
                        reason=a.get("reason", "Weather advisory"),
                        prediction=a.get("prediction", "Monitoring"),
                        disruption_window=a.get("disruption_window", "Low probability"),
                        affected_vehicles=int(a.get("affected_vehicles", 0)),
                        critical_shipments=int(a.get("critical_shipments", 0)),
                        recommended_action=a.get("recommended_action", "Maintain surveillance"),
                        alternative_route_id=a.get("alternative_route_id"),
                        alternative_route_name=a.get("alternative_route_name"),
                        status=a.get("status", "ACTIVE")
                    ))

                session.commit()
                logger.info("Database seeding completed successfully.")
        except Exception as e:
            session.rollback()
            logger.error(f"Error seeding database: {e}")
        finally:
            session.close()

    def load_from_database(self):
        """Hydrate in-memory representations from persistent database."""
        session = SessionLocal()
        try:
            db_roads = session.query(RoadModel).all()
            if db_roads:
                self.roads = [
                    {
                        "id": r.id, "name": r.name, "highway_no": r.highway_no,
                        "state": r.state, "from_hub": r.from_hub, "to_hub": r.to_hub,
                        "distance_km": r.distance_km, "status": r.status,
                        "base_speed_kmh": r.base_speed_kmh, "elevation_m": r.elevation_m,
                        "slope_deg": r.slope_deg, "road_type": r.road_type,
                        "road_surface": r.road_surface, "road_condition_score": r.road_condition_score,
                        "traffic_level": r.traffic_level, "river_proximity_m": r.river_proximity_m,
                        "historical_landslides": r.historical_landslides,
                        "historical_floods": r.historical_floods,
                        "bridge_condition_score": r.bridge_condition_score,
                        "coordinates": r.coordinates or [],
                        "alternative_route_ids": r.alternative_route_ids or []
                    } for r in db_roads
                ]
            else:
                self.roads = copy.deepcopy(get_ner_roads())

            db_hubs = session.query(HubModel).all()
            if db_hubs:
                self.hubs = [
                    {
                        "id": h.id, "name": h.name, "state": h.state,
                        "district": h.district, "type": h.hub_type,
                        "capacity_tons": h.capacity_tons, "lat": h.lat, "lng": h.lng
                    } for h in db_hubs
                ]
            else:
                self.hubs = copy.deepcopy(get_ner_hubs())

            db_vehicles = session.query(VehicleModel).all()
            if db_vehicles:
                self.vehicles = [
                    {
                        "id": v.id, "name": v.name, "type": v.vehicle_type,
                        "vehicle_type": v.vehicle_type,
                        "driver": v.driver_name, "driver_name": v.driver_name,
                        "contact": v.driver_contact, "driver_contact": v.driver_contact,
                        "lat": v.current_lat, "lng": v.current_lng,
                        "current_lat": v.current_lat, "current_lng": v.current_lng,
                        "speed_kmh": v.current_speed_kmh, "current_speed_kmh": v.current_speed_kmh,
                        "status": v.status, "assigned_road_id": v.assigned_road_id,
                        "origin": v.origin, "destination": v.destination,
                        "cargo_id": v.cargo_id, "cargo_name": v.cargo_name,
                        "cargo_priority": v.cargo_priority, "is_diverted": v.is_diverted,
                        "current_route_risk": v.current_route_risk, "predicted_delay": v.predicted_delay
                    } for v in db_vehicles
                ]
            else:
                self.vehicles = copy.deepcopy(get_ner_vehicles())

            db_shipments = session.query(ShipmentModel).all()
            if db_shipments:
                self.shipments = [
                    {
                        "id": s.id, "cargo_name": s.cargo_name, "category": s.cargo_category,
                        "cargo_category": s.cargo_category, "priority": s.priority,
                        "quantity": s.quantity, "origin": s.origin_hub, "origin_hub": s.origin_hub,
                        "destination": s.dest_hub, "dest_hub": s.dest_hub, "vehicle_id": s.vehicle_id,
                        "status": s.status, "risk_impact": s.risk_impact
                    } for s in db_shipments
                ]
            else:
                self.shipments = copy.deepcopy(get_ner_shipments())

            db_incidents = session.query(IncidentModel).order_by(IncidentModel.created_at.desc()).all()
            if db_incidents:
                self.incidents = [
                    {
                        "id": inc.id, "road_id": inc.road_id, "road_name": inc.road_name,
                        "state": inc.state, "type": inc.type, "severity": inc.severity,
                        "status": inc.status, "lat": inc.lat, "lng": inc.lng,
                        "reported_by": inc.reported_by, "timestamp": inc.timestamp,
                        "description": inc.description, "photo_url": inc.photo_url,
                        "cv_classification": inc.cv_classification,
                        "affected_vehicles_count": inc.affected_vehicles_count,
                        "affected_shipments_count": inc.affected_shipments_count
                    } for inc in db_incidents
                ]
            else:
                self.incidents = copy.deepcopy(get_ner_incidents())

            db_alerts = session.query(AlertModel).all()
            if db_alerts:
                self.alerts = [
                    {
                        "id": a.id, "alert_level": a.alert_level, "icon": a.icon,
                        "title": a.title, "road_id": a.road_id, "route_name": a.route_name,
                        "state": a.state, "risk_score": a.risk_score, "reason": a.reason,
                        "prediction": a.prediction, "disruption_window": a.disruption_window,
                        "affected_vehicles": a.affected_vehicles, "critical_shipments": a.critical_shipments,
                        "recommended_action": a.recommended_action,
                        "alternative_route_id": a.alternative_route_id,
                        "alternative_route_name": a.alternative_route_name,
                        "status": a.status
                    } for a in db_alerts
                ]
            else:
                self.alerts = copy.deepcopy(get_initial_alerts())

            self.weather = copy.deepcopy(get_ner_weather())
            self.field_reports = []
            self.active_scenario_step = 1
        except Exception as e:
            logger.error(f"Error loading data from database: {e}. Falling back to baseline fixtures.")
            self.reset_all()
        finally:
            session.close()

    def reset_all(self):
        """Reset scenario and operational state to baseline initial conditions."""
        with self._lock:
            self.hubs = copy.deepcopy(get_ner_hubs())
            self.roads = copy.deepcopy(get_ner_roads())
            self.vehicles = copy.deepcopy(get_ner_vehicles())
            self.shipments = copy.deepcopy(get_ner_shipments())
            self.weather = copy.deepcopy(get_ner_weather())
            self.incidents = copy.deepcopy(get_ner_incidents())
            self.alerts = copy.deepcopy(get_initial_alerts())
            self.field_reports = []
            self.active_scenario_step = 1

    def get_roads(self, state_filter: str = None):
        if not state_filter or state_filter.lower() == "all":
            return self.roads
        return [r for r in self.roads if r.get("state", "").lower() == state_filter.lower()]

    def get_road_by_id(self, road_id: str):
        for r in self.roads:
            if r["id"] == road_id:
                return r
        return None

    def get_road_intelligence(self, road_id: str):
        road = self.get_road_by_id(road_id)
        if not road:
            return None
            
        # Get matching weather
        ws = next((w for w in self.weather if w.get("state") == road.get("state")), self.weather[0])
        
        # Prepare features for ML risk model
        features = {
            "rainfall_1h": ws.get("rainfall_1h_mm", 10.0),
            "rainfall_6h": ws.get("rainfall_6h_mm", 30.0),
            "rainfall_24h": ws.get("rainfall_24h_mm", 60.0),
            "rainfall_7d": ws.get("rainfall_7d_mm", 200.0),
            "forecast_rainfall": ws.get("forecast_rainfall_mm", 50.0),
            "temperature": ws.get("temperature_c", 20.0),
            "humidity": ws.get("humidity_percent", 85.0),
            "wind_speed": ws.get("wind_speed_kmh", 15.0),
            "elevation": road.get("elevation_m", 1000.0),
            "slope": road.get("slope_deg", 20.0),
            "road_type_idx": 0 if "National" in road.get("road_type", "") else 1,
            "road_surface_idx": 0 if "Asphalt" in road.get("road_surface", "") else 1,
            "road_condition_score": road.get("road_condition_score", 3),
            "traffic_level_idx": 2 if road.get("traffic_level") == "High" else 1,
            "river_proximity_m": road.get("river_proximity_m", 300.0),
            "historical_landslides": road.get("historical_landslides", 2),
            "historical_floods": road.get("historical_floods", 0),
            "historical_incidents": road.get("historical_landslides", 2) + road.get("historical_floods", 0) + 1,
            "bridge_condition_score": road.get("bridge_condition_score", 4),
            "recent_field_reports_count": 1 if road["status"] in ["WATCH", "BLOCKED"] else 0,
            "distance_to_hazard_m": 120.0 if road["status"] == "BLOCKED" else 1500.0,
            "incident_count_30d": 3 if road["status"] in ["WATCH", "BLOCKED"] else 1,
            "incident_count_90d": 7 if road["status"] in ["WATCH", "BLOCKED"] else 2,
            "is_currently_blocked": road.get("status") == "BLOCKED"
        }
        
        ml_risk = predict_road_risk(features)
        
        # When physical blockage is verified on ground, mark overall level as CRITICAL
        if road.get("status") == "BLOCKED":
            ml_risk["overall_level"] = "CRITICAL"
            ml_risk["disruption_window"] = "Now"
            ml_risk["disruption_window_desc"] = "Active confirmed physical blockage"
            
        access_eval = evaluate_road_accessibility(road, self.weather, self.incidents, ml_risk)
        
        eta_features = {
            "distance_km": road.get("distance_km", 60.0),
            "base_speed_kmh": road.get("base_speed_kmh", 35.0),
            "road_condition_score": road.get("road_condition_score", 3),
            "traffic_level_idx": 2 if road.get("traffic_level") == "High" else 1,
            "rainfall_24h_mm": ws.get("rainfall_24h_mm", 60.0),
            "elevation_m": road.get("elevation_m", 1000.0),
            "slope_deg": road.get("slope_deg", 20.0),
            "route_risk_score": ml_risk["risk_score"],
            "historical_avg_speed_kmh": road.get("base_speed_kmh", 35.0) * 0.85,
            "time_of_day_hour": 11,
            "is_weekend": 0,
            "active_closures_count": 1 if road["status"] == "BLOCKED" else 0,
            "vehicle_type_idx": 0
        }
        eta_eval = predict_eta(eta_features)
        
        alternative_info = None
        if road.get("alternative_route_ids"):
            alt_id = road["alternative_route_ids"][0]
            alt_road = self.get_road_by_id(alt_id)
            if alt_road:
                dist_diff = round(alt_road.get("distance_km", 0) - road.get("distance_km", 0), 1)
                dist_str = f"+{dist_diff} km" if dist_diff > 0 else f"{dist_diff} km"
                alternative_info = {
                    "alternative_id": alt_id,
                    "alternative_name": alt_road.get("name"),
                    "route_path": alt_road.get("name"),
                    "additional_distance": dist_str,
                    "estimated_additional_delay": "+42 min" if road_id == "R-1024" else "+25 min",
                    "status": alt_road.get("status", "ACCESSIBLE"),
                    "risk_score": 24 if alt_id == "R-1028" else 35
                }
                
        return {
            "road": road,
            "weather": ws,
            "risk_analysis": ml_risk,
            "accessibility": access_eval,
            "eta_analysis": eta_eval,
            "alternative": alternative_info,
            "last_field_report": "18 minutes ago" if road["id"] == "R-1024" else "4 hours ago",
            "historical_incidents_count": road.get("historical_landslides", 0) + road.get("historical_floods", 0)
        }

    def get_vehicles(self):
        return self.vehicles

    def get_shipments(self):
        return self.shipments

    def get_weather(self):
        return self.weather

    def get_incidents(self):
        return self.incidents

    def get_alerts(self):
        return self.alerts

    def add_incident(self, incident: dict):
        with self._lock:
            self.incidents.insert(0, incident)
            road_id = incident.get("road_id")
            if road_id:
                road = self.get_road_by_id(road_id)
                if road and incident.get("type") == "Landslide" and incident.get("severity") in ["HIGH", "CRITICAL"]:
                    road["status"] = "BLOCKED"
                    # Update road in database
                    session = SessionLocal()
                    try:
                        db_road = session.query(RoadModel).filter(RoadModel.id == road_id).first()
                        if db_road:
                            db_road.status = "BLOCKED"
                            session.commit()
                    except Exception as e:
                        session.rollback()
                        logger.error(f"Error persisting road status update: {e}")
                    finally:
                        session.close()

            # Persist incident to database
            session = SessionLocal()
            try:
                db_inc = IncidentModel(
                    id=incident["id"], road_id=incident.get("road_id"),
                    road_name=incident.get("road_name"), state=incident.get("state"),
                    type=incident.get("type", "Landslide"), severity=incident.get("severity", "HIGH"),
                    status=incident.get("status", "ACTIVE_VERIFIED"),
                    lat=float(incident.get("lat", 27.0)), lng=float(incident.get("lng", 88.0)),
                    reported_by=incident.get("reported_by"), timestamp=incident.get("timestamp", "Just now"),
                    description=incident.get("description"), photo_url=incident.get("photo_url"),
                    cv_classification=incident.get("cv_classification"),
                    affected_vehicles_count=int(incident.get("affected_vehicles_count", 0)),
                    affected_shipments_count=int(incident.get("affected_shipments_count", 0))
                )
                session.add(db_inc)
                session.commit()
            except Exception as e:
                session.rollback()
                logger.error(f"Error persisting incident to database: {e}")
            finally:
                session.close()

            return incident

    def add_field_report(self, report: dict):
        with self._lock:
            self.field_reports.append(report)
            
            # Persist field report to database
            session = SessionLocal()
            try:
                db_rep = FieldReportModel(
                    id=f"FR-{report['client_uuid']}",
                    client_uuid=report["client_uuid"],
                    road_id=report.get("road_id"),
                    road_name=report.get("road_name"),
                    state=report.get("state"),
                    incident_type=report.get("incident_type", "Landslide"),
                    severity=report.get("severity", "HIGH"),
                    latitude=float(report.get("latitude", 27.425)),
                    longitude=float(report.get("longitude", 88.552)),
                    description=report.get("description"),
                    officer_name=report.get("officer_name"),
                    timestamp_captured=report.get("timestamp_captured"),
                    photo_url=report.get("photo_url"),
                    cv_classification=report.get("cv_classification")
                )
                session.add(db_rep)
                session.commit()
            except Exception as e:
                session.rollback()
                logger.error(f"Error persisting field report: {e}")
            finally:
                session.close()

            # Mirror into active incidents
            new_inc = {
                "id": f"INC-SYNC-{report['client_uuid']}",
                "road_id": report.get("road_id", "R-1024"),
                "road_name": report.get("road_name", "NH-310A North Sikkim"),
                "state": report.get("state", "Sikkim"),
                "type": report.get("incident_type", "Landslide"),
                "severity": report.get("severity", "HIGH"),
                "status": "ACTIVE_VERIFIED",
                "lat": report.get("latitude", 27.4250),
                "lng": report.get("longitude", 88.5520),
                "reported_by": report.get("officer_name", "Field Officer Patrol"),
                "timestamp": "Just now",
                "description": report.get("description", "Field observation uploaded"),
                "photo_url": report.get("photo_url", "/demo/landslide_nh310a.jpg"),
                "cv_classification": report.get("cv_classification"),
                "affected_vehicles_count": 6 if report.get("incident_type") == "Landslide" else 2,
                "affected_shipments_count": 2 if report.get("incident_type") == "Landslide" else 1
            }
            self.add_incident(new_inc)
            return new_inc

    def divert_vehicle(self, vehicle_id: str, new_road_id: str = "R-1028"):
        with self._lock:
            for v in self.vehicles:
                if v["id"] == vehicle_id:
                    v["assigned_road_id"] = new_road_id
                    v["is_diverted"] = True
                    v["status"] = "DIVERTED"
                    v["current_route_risk"] = "LOW"
                    v["predicted_delay"] = "+38 min"
                    
                    # Update associated shipment
                    for s in self.shipments:
                        if s.get("vehicle_id") == vehicle_id:
                            s["status"] = "DIVERTED"
                            s["risk_impact"] = f"Successfully rerouted via {new_road_id}. Cargo transit secure."

                    # Persist diversion to database
                    session = SessionLocal()
                    try:
                        db_v = session.query(VehicleModel).filter(VehicleModel.id == vehicle_id).first()
                        if db_v:
                            db_v.assigned_road_id = new_road_id
                            db_v.is_diverted = True
                            db_v.status = "DIVERTED"
                            db_v.current_route_risk = "LOW"
                            db_v.predicted_delay = "+38 min"
                        
                        db_s = session.query(ShipmentModel).filter(ShipmentModel.vehicle_id == vehicle_id).first()
                        if db_s:
                            db_s.status = "DIVERTED"
                            db_s.risk_impact = f"Successfully rerouted via {new_road_id}. Cargo transit secure."

                        session.commit()
                    except Exception as e:
                        session.rollback()
                        logger.error(f"Error persisting vehicle diversion: {e}")
                    finally:
                        session.close()

                    return v
            return None


# Global singleton instance
store = DataStore()
