"""
Rule + AI Based Alert Engine for North Eastern Region (NER).
Evaluates road risks and automatically triggers stratified alerts:
- 0–30: NORMAL
- 30–60: WATCH
- 60–80: WARNING
- 80–100: CRITICAL
Determines affected vehicle convoys and critical supply shipments (Medicine, Emergency supplies, Food).
Generates proactive diversion recommendations before disruptions strand vehicles.
"""

def generate_alert_for_road(road: dict, risk_eval: dict, vehicles: list, shipments: list) -> dict:
    """
    Generate an actionable decision alert when a road enters WATCH, WARNING, or CRITICAL thresholds.
    """
    road_id = road.get("id")
    risk_score = risk_eval.get("risk_score", 15)
    disruption_window = risk_eval.get("disruption_window", "Low probability")
    
    if risk_score < 30:
        return None # Normal condition, no alert needed
        
    if risk_score >= 80:
        alert_level = "CRITICAL"
        icon = "🚨"
    elif risk_score >= 60:
        alert_level = "WARNING"
        icon = "⚠️"
    else:
        alert_level = "WATCH"
        icon = "👁️"
        
    # Identify affected vehicles
    affected_vehs = [
        v for v in vehicles 
        if v.get("assigned_road_id") == road_id or 
        (v.get("origin") == road.get("from_hub") and v.get("destination") == road.get("to_hub"))
    ]
    affected_veh_count = len(affected_vehs)
    
    # Identify affected critical shipments (Medicine, Emergency, Food)
    affected_shipment_ids = {v.get("cargo_id") for v in affected_vehs if v.get("cargo_id")}
    affected_ships = [s for s in shipments if s.get("id") in affected_shipment_ids and s.get("priority", 0) >= 85]
    critical_shipment_count = len(affected_ships)
    
    # Generate action text
    if alert_level == "CRITICAL":
        rec_action = "IMMEDIATE ACTION REQUIRED: Divert essential supply vehicles through alternative bypass corridor. Halt heavy convoys at staging checkpoint."
        pred_text = f"Immediate or imminent disruption ({disruption_window}). Passage highly compromised."
    elif alert_level == "WARNING":
        rec_action = f"STAGE CONVOYS: Enforce 20-minute departure spacing. Pre-alert secondary route operators for possible diversion within {disruption_window}."
        pred_text = f"Predicted potential disruption within {disruption_window} based on weather escalation."
    else:
        rec_action = "CONTINUOUS SURVEILLANCE: Deploy field officer drone patrol. Monitor slope telemetry hourly."
        pred_text = "Advisory watch. Road accessible but deteriorating under steady rainfall."
        
    # Identify alternative route recommendation
    alt_route_id = None
    alt_route_name = "Secondary Arterial Bypass"
    if road.get("alternative_route_ids"):
        alt_route_id = road["alternative_route_ids"][0]
        if road_id == "R-1024":
            alt_route_name = "Route B (Dikchu – Phodong Western Bypass: +18 km, +42 min, Risk 24%)"
        elif road_id == "R-1035":
            alt_route_name = "Lava – Algarah Mountain Bypass"
            
    reason = risk_eval.get("reason", "Cumulative terrain and weather hazard saturation.")
    if risk_eval.get("contributors"):
        top_c = [c["factor"] for c in risk_eval["contributors"][:2]]
        reason = " + ".join(top_c)
        
    return {
        "id": f"ALT-{road_id}-{risk_score}",
        "alert_level": alert_level,
        "icon": icon,
        "title": f"{alert_level} ALERT: {road.get('name')}",
        "road_id": road_id,
        "route_name": road.get("name"),
        "state": road.get("state", "NER"),
        "risk_score": risk_score,
        "reason": reason,
        "prediction": pred_text,
        "disruption_window": disruption_window,
        "affected_vehicles": affected_veh_count,
        "critical_shipments": critical_shipment_count,
        "recommended_action": rec_action,
        "alternative_route_id": alt_route_id,
        "alternative_route_name": alt_route_name,
        "status": "ACTION_REQUIRED" if alert_level == "CRITICAL" else "ACTIVE"
    }
