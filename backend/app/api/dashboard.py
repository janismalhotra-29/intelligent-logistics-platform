"""
Dashboard API router for the NER Logistics Intelligence Platform.
Computes live KPI cards, situation metrics, state vulnerability rankings,
and regional overview analytics dynamically from active road network data.
"""

from fastapi import APIRouter
from backend.app.services.data_store import store

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

NER_STATES = [
    "Assam", "Arunachal Pradesh", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Sikkim", "Tripura"
]


@router.get("")
def get_dashboard_summary():
    roads = store.roads
    vehicles = store.vehicles
    shipments = store.shipments
    alerts = store.alerts
    incidents = store.incidents
    
    total_roads = len(roads)
    blocked_roads = len([r for r in roads if r.get("status") == "BLOCKED"])
    high_risk_roads = len([r for r in roads if r.get("status") in ["WATCH", "RESTRICTED", "BLOCKED"]])
    active_vehicles = len([v for v in vehicles if v.get("status") in ["EN_ROUTE", "DIVERTED", "STOPPED"]])
    critical_shipments = len([s for s in shipments if s.get("priority", 0) >= 85])
    delayed_shipments = len([s for s in shipments if s.get("status") in ["DELAYED", "DIVERTED"]])
    active_alerts = len([a for a in alerts if a.get("status") in ["ACTIVE", "ACTION_REQUIRED"]])
    incidents_reported = len(incidents)
    
    # Compute state-wise road vulnerability count dynamically from active roads
    state_breakdown = {}
    for st in NER_STATES:
        state_roads = [r for r in roads if r.get("state", "").lower() == st.lower()]
        st_total = len(state_roads)
        st_high_risk = len([r for r in state_roads if r.get("status") in ["WATCH", "RESTRICTED", "BLOCKED"]])
        st_blocked = len([r for r in state_roads if r.get("status") == "BLOCKED"])
        state_breakdown[st] = {
            "total": st_total,
            "high_risk": st_high_risk,
            "blocked": st_blocked
        }
    
    # Recent critical alerts feed
    top_alerts = alerts[:5]
    
    return {
        "kpis": {
            "total_roads_monitored": total_roads,
            "high_risk_roads": high_risk_roads,
            "blocked_roads": blocked_roads,
            "vehicles_active": active_vehicles,
            "critical_shipments": critical_shipments,
            "delayed_shipments": delayed_shipments,
            "active_alerts": active_alerts,
            "incidents_reported": incidents_reported
        },
        "state_breakdown": state_breakdown,
        "recent_alerts": top_alerts,
        "scenario_step": getattr(store, "active_scenario_step", 1),
        "is_simulation_mode": True
    }
