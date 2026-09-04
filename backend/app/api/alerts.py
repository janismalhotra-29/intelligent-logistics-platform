"""
Alerts API router for the NER Logistics Intelligence Platform.
Delivers rule + AI generated decision alerts, vehicle and critical shipment impacts,
and alert resolution workflows.
"""

from fastapi import APIRouter, HTTPException
from backend.app.services.data_store import store

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("")
def list_alerts():
    """List active warnings and critical alerts across the network."""
    return store.get_alerts()

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    """Acknowledge and mark an alert as resolved or mitigated."""
    for a in store.alerts:
        if a["id"] == alert_id:
            a["status"] = "RESOLVED"
            return {"status": "SUCCESS", "alert": a}
    raise HTTPException(status_code=404, detail="Alert not found")
