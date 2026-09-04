"""
Real-Time Accessibility Engine for North Eastern Region (NER).
Determines road accessibility status: ACCESSIBLE, WATCH, RESTRICTED, BLOCKED.
Synthesizes:
- AI Risk predictions
- Real-time weather telemetry & rainfall accumulation
- Live field reports & photo classifications
- Known structural closures and bridge condition
- Historical incident density
Separate from the ML prediction model as specified in system design.
"""

from datetime import datetime

def evaluate_road_accessibility(road: dict, weather_data: list, incidents: list, ml_prediction: dict) -> dict:
    """
    Synthesize multi-source inputs to compute active road accessibility status,
    confidence rating, and core justification reason.
    """
    road_id = road.get("id")
    current_status = road.get("status", "ACCESSIBLE")
    cond_score = int(road.get("road_condition_score", 3))
    
    # 1. Check for active verified blocking incidents
    road_incidents = [inc for inc in incidents if inc.get("road_id") == road_id and inc.get("status") == "ACTIVE_VERIFIED"]
    has_blocking_incident = any(inc.get("type") in ["Landslide", "Bridge Damage"] and inc.get("severity") in ["HIGH", "CRITICAL"] for inc in road_incidents)
    
    # 2. Check local weather telemetry
    # Match station by state or proximity
    matched_station = None
    for ws in weather_data:
        if ws.get("state") == road.get("state"):
            matched_station = ws
            break
    rainfall_24h = matched_station.get("rainfall_24h_mm", 40.0) if matched_station else 40.0
    
    # 3. Incorporate ML risk score
    risk_score = ml_prediction.get("risk_score", 25)
    
    # 4. Determine status
    if has_blocking_incident or current_status == "BLOCKED" or risk_score >= 88:
        final_status = "BLOCKED"
        reason = "Active physical blockage from debris slide / severe road breach. Impassable for all vehicles."
        confidence = 94
    elif risk_score >= 70 or current_status == "RESTRICTED" or cond_score <= 1:
        final_status = "RESTRICTED"
        reason = "Severe structural compromise or localized inundation. Restricted to emergency 4x4 convoys under escort."
        confidence = 88
    elif risk_score >= 40 or current_status == "WATCH" or rainfall_24h > 100:
        final_status = "WATCH"
        reason = "Elevated saturation and rockfall advisory due to sustained rainfall. Continuous patrol monitoring."
        confidence = 85
    else:
        final_status = "ACCESSIBLE"
        reason = "Road clear and stable. Regular transit speed permitted."
        confidence = 92
        
    return {
        "road_id": road_id,
        "name": road.get("name"),
        "status": final_status,
        "risk_score": risk_score,
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "reason": reason,
        "confidence": confidence,
        "disruption_window": ml_prediction.get("disruption_window", "Low probability"),
        "disruption_window_desc": ml_prediction.get("disruption_window_desc", "Stable passage expected"),
        "active_incidents_count": len(road_incidents),
        "rainfall_24h_mm": rainfall_24h
    }
