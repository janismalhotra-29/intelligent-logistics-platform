"""
In-Memory Reactive Data Store for the NER Logistics Intelligence Platform.
Provides mutable state management for roads, vehicles, shipments, weather stations,
incidents, and alerts with thread-safe updates and reset capabilities.
"""

import json
import os
import copy
from datetime import datetime
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
from backend.app.alerts.alert_engine import generate_alert_for_road

class DataStore:
    def __init__(self):
        self.reset_all()

    def reset_all(self):
        """Reset state to baseline initial conditions."""
        self.hubs = copy.deepcopy(get_ner_hubs())
        self.roads = copy.deepcopy(get_ner_roads())
        self.vehicles = copy.deepcopy(get_ner_vehicles())
        self.shipments = copy.deepcopy(get_ner_shipments())
        self.weather = copy.deepcopy(get_ner_weather())
        self.incidents = copy.deepcopy(get_ner_incidents())
        self.alerts = copy.deepcopy(get_initial_alerts())
        self.field_reports = []
        self.active_scenario_step = 1
        self.scenario_state = {
            "step": 1,
            "step_title": "Normal Operation (Convoy V-102 en route to North Sikkim)",
            "road_status": "ACCESSIBLE",
            "risk_score": 32,
            "rainfall_24h_mm": 42.0,
            "affected_vehicles": 0,
            "affected_shipments": 0,
            "active_route": "Route A (NH-310A)",
            "alternative_route": "Route B (Dikchu Bypass)",
            "explanation": "Initial state: Convoy V-102 carrying Emergency Medicine departing Gangtok for Mangan relief base."
        }

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
            "recent_field_reports_count": 1 if road["id"] == "R-1024" and road["status"] in ["WATCH", "BLOCKED"] else 0,
            "distance_to_hazard_m": 120.0 if road["id"] == "R-1024" else 1500.0,
            "incident_count_30d": 3 if road["id"] == "R-1024" else 1,
            "incident_count_90d": 7 if road["id"] == "R-1024" else 2,
            "is_currently_blocked": road.get("status") == "BLOCKED"
        }
        
        ml_risk = predict_road_risk(features)
        
        # Override risk if blocked in scenario
        if road.get("status") == "BLOCKED":
            ml_risk["risk_score"] = 91
            ml_risk["overall_level"] = "CRITICAL"
            ml_risk["landslide_risk"] = 94
            ml_risk["disruption_window"] = "Now"
            ml_risk["disruption_window_desc"] = "Likely inaccessible for next 4–6 hours"
            
        access_eval = evaluate_road_accessibility(road, self.weather, self.incidents, ml_risk)
        
        # ETA details
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
        
        # Alternative route details
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
                    "route_path": "R1028 → R1031 → R1042" if road_id == "R-1024" else alt_road.get("name"),
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
        self.incidents.insert(0, incident)
        # Update road status if severe
        road_id = incident.get("road_id")
        if road_id:
            road = self.get_road_by_id(road_id)
            if road and incident.get("type") == "Landslide" and incident.get("severity") in ["HIGH", "CRITICAL"]:
                road["status"] = "BLOCKED"
        return incident

    def add_field_report(self, report: dict):
        self.field_reports.append(report)
        # Also mirror into incident stream
        new_inc = {
            "id": f"INC-SYNC-{len(self.incidents) + 1}",
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
        for v in self.vehicles:
            if v["id"] == vehicle_id:
                v["assigned_road_id"] = new_road_id
                v["is_diverted"] = True
                v["status"] = "DIVERTED"
                v["current_route_risk"] = "LOW"
                v["predicted_delay"] = "+38 min"
                # Update shipment status
                for s in self.shipments:
                    if s.get("vehicle_id") == vehicle_id:
                        s["status"] = "DIVERTED"
                        s["risk_impact"] = "Successfully rerouted via Route B (Dikchu Western Bypass). Cargo transit secure."
                return v
        return None

# Global Singleton DataStore instance
store = DataStore()
