"""
Field Reports and Offline Synchronization API router.
Enables field officers to synchronize reports captured while disconnected.
Includes batch limits, regional geographic bounds validation, and duplicate suppression.
"""

from typing import List, Set
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from backend.app.services.data_store import store
from backend.app.auth import require_operator_or_officer

router = APIRouter(prefix="/api/field-reports", tags=["Field Reports"])

# In-memory tracking of processed client UUIDs to prevent replay duplicates
_PROCESSED_UUIDS: Set[str] = set()


class FieldReportItem(BaseModel):
    client_uuid: str = Field(min_length=5, max_length=64, description="Unique report ID generated offline")
    road_id: str = Field(default="R-1024", max_length=60)
    road_name: str = Field(default="NH-310A North Sikkim", max_length=200)
    state: str = Field(default="Sikkim", max_length=100)
    incident_type: str = Field(default="Landslide", max_length=60)
    severity: str = Field(default="HIGH", pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$")
    latitude: float = Field(ge=20.0, le=32.0, description="Valid NER region latitude")
    longitude: float = Field(ge=85.0, le=99.0, description="Valid NER region longitude")
    description: str = Field(max_length=2000)
    officer_name: str = Field(default="Patrol Officer", max_length=150)
    timestamp_captured: str = Field(max_length=60)
    photo_url: str = Field(default="/demo/landslide_nh310a.jpg", max_length=500)
    cv_classification: dict = Field(default_factory=dict)


class BatchSyncRequest(BaseModel):
    reports: List[FieldReportItem] = Field(
        min_length=1, 
        max_length=50, 
        description="Batch collection of offline reports (maximum 50 per sync request)"
    )


@router.post("/sync")
def sync_offline_reports(
    payload: BatchSyncRequest,
    auth: dict = Depends(require_operator_or_officer)
):
    """
    Batch upload endpoint for field reports queued locally during offline connectivity.
    Protected against duplicate replay and unbounded request bodies.
    """
    synced_items = []
    duplicate_count = 0
    
    for r in payload.reports:
        # Deduplication check
        if r.client_uuid in _PROCESSED_UUIDS:
            duplicate_count += 1
            continue
            
        saved = store.add_field_report(r.model_dump())
        _PROCESSED_UUIDS.add(r.client_uuid)
        synced_items.append(saved)
        
    return {
        "status": "SYNCED",
        "synced_count": len(synced_items),
        "duplicates_skipped": duplicate_count,
        "message": f"Successfully synchronized {len(synced_items)} new report(s) ({duplicate_count} duplicate(s) skipped)."
    }
