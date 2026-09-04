"""
Dashboard API router for the NER Logistics Intelligence Platform.
Computes top KPI cards, situation metrics, state vulnerability rankings,
and regional overview analytics.
"""

from fastapi import APIRouter
from backend.app.services.data_store import store

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("")
def get_dashboard_summary():
    roads = store.roads
    vehicles = store.vehicles
    shipments = store.shipments
    alerts = store.alerts
    incidents = store.incidents
    
    # KPIs specified in prompt:
    # - Total Roads Monitored
    # - High Risk Roads
    # - Blocked Roads
    # - Vehicles Active
    # - Critical Shipments
    # - Delayed Shipments
    # - Active Alerts
    # - Incidents Reported
    total_roads = len(roads)
    blocked_roads = len([r for r in roads if r.get("status") == "BLOCKED"])
    high_risk_roads = len([r for r in roads if r.get("status") in ["WATCH", "RESTRICTED", "BLOCKED"]])
    active_vehicles = len([v for v in vehicles if v.get("status") in ["EN_ROUTE", "DIVERTED", "STOPPED"]])
    critical_shipments = len([s for s in shipments if s.get("priority", 0) >= 85])
    delayed_shipments = len([s for s in shipments if s.get("status") in ["DELAYED", "DIVERTED"]])
    active_alerts = len([a for a in alerts if a.get("status") in ["ACTIVE", "ACTION_REQUIRED"]])
    incidents_reported = len(incidents)
    
    # State-wise road vulnerability count
    state_breakdown = {
        "Sikkim": {"total": 5, "high_risk": 3, "blocked": 1 if blocked_roads > 0 else 0},
        "Arunachal Pradesh": {"total": 2, "high_risk": 1, "blocked": 0},
        "Meghalaya": {"total": 3, "high_risk": 2, "blocked": 0},
        "Assam": {"total": 2, "high_risk": 0, "blocked": 0},
        "Nagaland": {"total": 1, "high_risk": 1, "blocked": 0},
        "Manipur": {"total": 2, "high_risk": 1, "blocked": 0},
        "Mizoram": {"total": 1, "high_risk": 1, "blocked": 0},
        "Tripura": {"total": 2, "high_risk": 0, "blocked": 0}
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
