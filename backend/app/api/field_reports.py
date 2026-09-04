"""
Field Reports and Offline Synchronization API router.
Enables field officers to synchronize reports captured while disconnected.
"""

from typing import List
from fastapi import APIRouter
from pydantic import BaseModel, Field
from backend.app.services.data_store import store

router = APIRouter(prefix="/api/field-reports", tags=["Field Reports"])

class FieldReportItem(BaseModel):
    client_uuid: str = Field(description="Unique report ID generated offline")
    road_id: str = Field(default="R-1024")
    road_name: str = Field(default="NH-310A North Sikkim")
    state: str = Field(default="Sikkim")
    incident_type: str = Field(default="Landslide")
    severity: str = Field(default="HIGH")
    latitude: float
    longitude: float
    description: str
    officer_name: str = Field(default="Patrol Officer")
    timestamp_captured: str
    photo_url: str = Field(default="/demo/landslide_nh310a.jpg")
    cv_classification: dict = Field(default_factory=dict)

class BatchSyncRequest(BaseModel):
    reports: List[FieldReportItem]

@router.post("/sync")
def sync_offline_reports(payload: BatchSyncRequest):
    """
    Batch upload endpoint for field reports queued locally during offline connectivity.
    """
    synced_items = []
    for r in payload.reports:
        saved = store.add_field_report(r.model_dump())
        synced_items.append(saved)
        
    return {
        "status": "SYNCED",
        "synced_count": len(synced_items),
        "message": f"Successfully synchronized {len(synced_items)} offline field report(s) into command center database."
    }
