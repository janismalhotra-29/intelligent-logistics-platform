"""
Alerts API router for the NER Logistics Intelligence Platform.
Delivers rule + AI generated decision alerts, vehicle and critical shipment impacts,
and alert resolution workflows.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from backend.app.services.data_store import store

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("")
def list_alerts(
    limit: Optional[int] = Query(default=None, ge=1, le=200),
    offset: int = Query(default=0, ge=0)
):
    """List active warnings and critical alerts across the network with optional pagination."""
    all_alerts = store.get_alerts()
    if limit is not None:
        return all_alerts[offset : offset + limit]
    return all_alerts


@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    """Acknowledge and mark an alert as resolved or mitigated."""
    for a in store.alerts:
        if a["id"] == alert_id:
            a["status"] = "RESOLVED"
            return {"status": "SUCCESS", "alert": a}
    raise HTTPException(status_code=404, detail="Alert not found")
