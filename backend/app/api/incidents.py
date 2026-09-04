"""
Incidents and Computer Vision Photo Classification API router.
Enables field incident reporting, photo upload classification,
and incident verification.
"""

from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from backend.app.services.data_store import store
from ml.incident_classifier.classify import analyze_image_features, simulate_incident_classification

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

class CreateIncidentRequest(BaseModel):
    road_id: Optional[str] = "R-1024"
    type: str = "Landslide"
    severity: str = "HIGH"
    latitude: float = 27.4250
    longitude: float = 88.5520
    description: str = "Debris fall observed on highway sector"
    reported_by: str = "Field Officer"

@router.get("")
def list_incidents():
    """List active verified incidents across all 8 NER states."""
    return store.get_incidents()

@router.post("")
def create_incident(payload: CreateIncidentRequest):
    """Report a new verified incident directly."""
    new_inc = {
        "id": f"INC-MANUAL-{len(store.incidents) + 1}",
        "road_id": payload.road_id,
        "road_name": store.get_road_by_id(payload.road_id).get("name") if store.get_road_by_id(payload.road_id) else "NER Highway",
        "state": store.get_road_by_id(payload.road_id).get("state") if store.get_road_by_id(payload.road_id) else "NER",
        "type": payload.type,
        "severity": payload.severity,
        "status": "ACTIVE_VERIFIED",
        "lat": payload.latitude,
        "lng": payload.longitude,
        "reported_by": payload.reported_by,
        "timestamp": "Just now",
        "description": payload.description,
        "photo_url": "/demo/landslide_nh310a.jpg",
        "cv_classification": {
            "detected_type": payload.type,
            "confidence": 92,
            "severity": payload.severity,
            "recommended_action": "Verify roadblock clearance with BRO / local PWD division."
        },
        "affected_vehicles_count": 6 if payload.type == "Landslide" else 2,
        "affected_shipments_count": 2 if payload.type == "Landslide" else 1
    }
    return store.add_incident(new_inc)

@router.post("/classify-photo")
async def classify_incident_photo(
    file: Optional[UploadFile] = File(None),
    simulated_type: Optional[str] = Form(None)
):
    """
    Computer vision photo analysis:
    Classifies road photo into Landslide, Flood, Road Damage, Bridge Damage, Traffic Obstruction, Normal.
    """
    if file and file.filename:
        try:
            content = await file.read()
            return analyze_image_features(content)
        except Exception:
            return simulate_incident_classification(simulated_type or "Landslide")
    else:
        return simulate_incident_classification(simulated_type or "Landslide")
