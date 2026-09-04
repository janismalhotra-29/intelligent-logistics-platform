"""
Scenario Service managing contingency drills for disaster decision support.
Supports multiple convoy targets and corridors:
1. V-102 (Sikkim: NH-310A Gangtok -> Mangan Landslide Drill -> Route B Dikchu Bypass)
2. V-110 (Manipur: NH-37 Silchar -> Imphal Makru Bridge Disruption -> Jiribam Bypass)
3. V-108 (Mizoram: NH-306 Silchar -> Aizawl Kolasib Slump -> Bairabi Corridor)
4. V-104 (Assam: NH-27 Guwahati -> Silchar Flood Inundation -> Meghalaya Bypass)
"""

from backend.app.services.data_store import store

CONVOY_SCENARIOS = {
    "V-102": {
        "road_id": "R-1024",
        "alt_road_id": "R-1028",
        "station_id": "W-SK-MANGAN",
        "cargo_id": "S-201",
        "title": "North Sikkim NH-310A Landslide Drill",
        "route_name": "NH-310A Gangtok – Mangan",
        "alt_name": "Route B (Dikchu Western Bypass)",
        "hazard_desc": "Heavy rainfall (142mm/24h) + 34° slope collapse at Mile-14",
        "alt_overhead": "+18 km, +32 min",
        "state": "Sikkim"
    },
    "V-110": {
        "road_id": "R-6020",
        "alt_road_id": "R-6010",
        "station_id": "W-MN-IMP",
        "cargo_id": "S-205",
        "title": "Manipur NH-37 Makru Bridge Flood Drill",
        "route_name": "NH-37 Silchar – Imphal",
        "alt_name": "Old Cachar / Jiribam Mountain Bypass",
        "hazard_desc": "River flash flood washed out bridge approach roadway",
        "alt_overhead": "+35 km, +1h 10m",
        "state": "Manipur"
    },
    "V-108": {
        "road_id": "R-7010",
        "alt_road_id": "R-7020",
        "station_id": "W-MZ-AIZ",
        "cargo_id": "S-204",
        "title": "Mizoram NH-306 Kolasib Subsidence Drill",
        "route_name": "NH-306 Silchar – Aizawl",
        "alt_name": "Bairabi – Sairang Strategic Bypass",
        "hazard_desc": "Subsurface mud slump blocking Kolasib hill pass",
        "alt_overhead": "+24 km, +45 min",
        "state": "Mizoram"
    },
    "V-104": {
        "road_id": "R-2010",
        "alt_road_id": "R-2020",
        "station_id": "W-AS-GUW",
        "cargo_id": "S-202",
        "title": "Assam NH-27 Brahmaputra Valley Flood Drill",
        "route_name": "NH-27 Guwahati – Nagaon – Silchar",
        "alt_name": "Meghalaya Plateau Route (NH-6)",
        "hazard_desc": "Brahmaputra river overflow submerging low-lying carriageway",
        "alt_overhead": "+40 km, +1h 15m",
        "state": "Assam"
    }
}

def execute_scenario_step(step_number: int, vehicle_id: str = "V-102") -> dict:
    """Execute a step in the contingency demonstration for the chosen convoy."""
    cfg = CONVOY_SCENARIOS.get(vehicle_id, CONVOY_SCENARIOS["V-102"])
    target_road = store.get_road_by_id(cfg["road_id"])
    alt_road = store.get_road_by_id(cfg["alt_road_id"]) or store.get_road_by_id("R-1028")
    weather_st = next((w for w in store.weather if w["station_id"] == cfg["station_id"]), store.weather[0])
    veh = next((v for v in store.vehicles if v["id"] == vehicle_id), store.vehicles[0])
    ship = next((s for s in store.shipments if s["id"] == cfg["cargo_id"]), store.shipments[0])

    store.active_scenario_step = step_number

    if step_number == 1:
        # Step 1: Normal state
        if target_road:
            target_road["status"] = "ACCESSIBLE"
        weather_st["rainfall_24h_mm"] = 42.0
        weather_st["warning_level"] = "NORMAL"
        veh["is_diverted"] = False
        veh["assigned_road_id"] = cfg["road_id"]
        veh["status"] = "EN_ROUTE"
        veh["current_route_risk"] = "LOW"
        veh["predicted_delay"] = "+15 min"
        ship["status"] = "IN_TRANSIT"
        ship["risk_impact"] = f"Normal progress on {cfg['route_name']}. Low hazard index."
        
        return {
            "step": 1,
            "vehicle_id": vehicle_id,
            "step_title": f"1. Initial State: Normal Transit ({veh['name']})",
            "state_badge": "STABLE",
            "vehicle": f"{veh['id']} ({veh['name']})",
            "cargo": f"{veh['cargo_name']} (Priority {veh.get('cargo_priority', 100)})",
            "route": f"Primary ({cfg['route_name']})",
            "road_status": "ACCESSIBLE",
            "rainfall_24h": "42 mm / 24h",
            "risk_score": 32,
            "normal_eta": veh.get("normal_eta", "4h 20m"),
            "predicted_delay": "+15 min",
            "affected_vehicles": 0,
            "affected_shipments": 0,
            "system_action": f"Highway clear. {veh['name']} proceeding on schedule."
        }

    elif step_number == 2:
        # Step 2: Torrential rain / flood trigger
        if target_road:
            target_road["status"] = "WATCH"
        weather_st["rainfall_24h_mm"] = 142.0
        weather_st["warning_level"] = "RED_ALERT"
        veh["current_route_risk"] = "HIGH"
        veh["predicted_delay"] = "+48 min"
        ship["risk_impact"] = f"Severe monsoon downpour detected. Slope/drainage saturation critical on {cfg['route_name']}."

        return {
            "step": 2,
            "vehicle_id": vehicle_id,
            "step_title": f"2. Trigger: Extreme Weather Event ({cfg['state']})",
            "state_badge": "ELEVATED_RISK",
            "vehicle": f"{veh['id']} ({veh['name']})",
            "cargo": veh["cargo_name"],
            "route": cfg["route_name"],
            "road_status": "WATCH",
            "rainfall_24h": "142 mm / 24h (Sustained Downpour)",
            "risk_score": 68,
            "normal_eta": veh.get("normal_eta", "4h 20m"),
            "predicted_delay": "+48 min",
            "affected_vehicles": 6,
            "affected_shipments": 2,
            "system_action": f"AI Risk model elevates hazard to 68%. Advisory dispatched to Convoy {veh['id']}."
        }

    elif step_number == 3:
        # Step 3: Road blockage & critical alert
        if target_road:
            target_road["status"] = "BLOCKED"
        veh["current_route_risk"] = "CRITICAL"
        veh["status"] = "STOPPED"
        veh["predicted_delay"] = "+1h 50m (Impassable)"
        ship["status"] = "DELAYED"
        ship["risk_impact"] = f"CRITICAL DISRUPTION: {cfg['route_name']} blocked. Hazard: {cfg['hazard_desc']}."
        
        crit_alert = {
            "id": f"ALT-SCENARIO-{vehicle_id}",
            "alert_level": "CRITICAL",
            "icon": "🚨",
            "title": f"CRITICAL ALERT: {cfg['route_name']} BLOCKED",
            "road_id": cfg["road_id"],
            "route_name": cfg["route_name"],
            "state": cfg["state"],
            "risk_score": 91,
            "reason": cfg["hazard_desc"],
            "prediction": "Carriageway completely impassable for the next 4–6 hours.",
            "affected_vehicles": 6,
            "critical_shipments": 2,
            "recommended_action": f"DIVERT CONVOY {veh['id']}: Reroute via {cfg['alt_name']}.",
            "alternative_route_id": cfg["alt_road_id"],
            "alternative_route_name": cfg["alt_name"],
            "status": "ACTION_REQUIRED"
        }
        store.alerts = [crit_alert] + [a for a in store.alerts if a.get("id") != f"ALT-SCENARIO-{vehicle_id}"]

        return {
            "step": 3,
            "vehicle_id": vehicle_id,
            "step_title": f"3. Disruption: Corridor Blocked ({cfg['route_name']})",
            "state_badge": "DISRUPTION_ACTIVE",
            "vehicle": f"{veh['id']} (Halted at Staging Point)",
            "cargo": veh["cargo_name"],
            "route": f"{cfg['route_name']} -> BLOCKED",
            "road_status": "BLOCKED",
            "rainfall_24h": "142 mm / 24h",
            "risk_score": 91,
            "predicted_delay": "+1h 50m (Stranded)",
            "affected_vehicles": 6,
            "affected_shipments": 2,
            "system_action": f"Road colored RED. AI router calculates bypass: {cfg['alt_name']} ({cfg['alt_overhead']}, Risk 24%).",
            "alternative_route": {
                "name": cfg["alt_name"],
                "overhead": cfg["alt_overhead"],
                "risk_score": 24,
                "feasibility": "CLEAR & PASSABLE"
            }
        }

    elif step_number == 4:
        # Step 4: Convoy diverted to safe alternative
        store.divert_vehicle(vehicle_id, cfg["alt_road_id"])
        
        return {
            "step": 4,
            "vehicle_id": vehicle_id,
            "step_title": f"4. Resolution: Convoy {veh['id']} Rerouted Safe",
            "state_badge": "RESOLVED_SAFE",
            "vehicle": f"{veh['id']} (Diverted & En Route)",
            "cargo": f"{veh['cargo_name']} (Secured)",
            "route": cfg["alt_name"],
            "road_status": f"ACCESSIBLE (On {cfg['alt_name']})",
            "original_route_status": f"BLOCKED ({cfg['route_name']})",
            "rainfall_24h": "142 mm / 24h",
            "risk_score": 24,
            "predicted_delay": "+32 min (Controlled)",
            "affected_vehicles": 6,
            "critical_shipments": 0,
            "system_action": f"Convoy {veh['id']} successfully bypassed hazard zone. Critical supplies delivery guaranteed."
        }

    return execute_scenario_step(1, vehicle_id)

def get_scenario_status():
    return {
        "active_step": getattr(store, "active_scenario_step", 1),
        "active_vehicle": "V-102"
    }
