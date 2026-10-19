"""
Incidents and Computer Vision Photo Classification API router.
Enables field incident reporting, photo upload classification with strict validation,
and incident verification.
"""

import uuid
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Query, status
from pydantic import BaseModel, Field
from backend.app.services.data_store import store
from backend.app.config import settings
from backend.app.auth import require_operator_or_officer
from ml.incident_classifier.classify import analyze_image_features, simulate_incident_classification

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])


class CreateIncidentRequest(BaseModel):
    road_id: Optional[str] = Field(default="R-1024", max_length=60)
    type: str = Field(default="Landslide", max_length=60)
    severity: str = Field(default="HIGH", pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$")
    latitude: float = Field(default=27.4250, ge=20.0, le=32.0)
    longitude: float = Field(default=88.5520, ge=85.0, le=99.0)
    description: str = Field(default="Debris fall observed on highway sector", max_length=2000)
    reported_by: str = Field(default="Field Officer", max_length=150)


@router.get("")
def list_incidents(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0)
):
    """List active verified incidents across all 8 NER states with pagination."""
    all_incidents = store.get_incidents()
    return all_incidents[offset : offset + limit]


@router.post("")
def create_incident(
    payload: CreateIncidentRequest,
    auth: dict = Depends(require_operator_or_officer)
):
    """Report a new verified incident directly (requires Operator or Field Officer role)."""
    target_road = store.get_road_by_id(payload.road_id) if payload.road_id else None
    road_name = target_road.get("name") if target_road else "NER Highway Sector"
    state_name = target_road.get("state") if target_road else "NER"
    
    new_inc = {
        "id": f"INC-MANUAL-{uuid.uuid4().hex[:8].upper()}",
        "road_id": payload.road_id,
        "road_name": road_name,
        "state": state_name,
        "type": payload.type,
        "severity": payload.severity,
        "status": "ACTIVE_VERIFIED",
        "lat": round(payload.latitude, 6),
        "lng": round(payload.longitude, 6),
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
    Enforces strict upload size limits (max 5MB) and supported image MIME validation.
    """
    if file and file.filename:
        # 1. Validate content type header
        if file.content_type not in settings.ALLOWED_IMAGE_MIMES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file type '{file.content_type}'. Supported types: {', '.join(settings.ALLOWED_IMAGE_MIMES)}"
            )

        # 2. Read in chunks to prevent memory exhaustion
        chunk_size = 64 * 1024
        content = bytearray()
        bytes_read = 0
        
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            bytes_read += len(chunk)
            if bytes_read > settings.MAX_UPLOAD_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File exceeds maximum allowed upload size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)} MB."
                )
            content.extend(chunk)

        if len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty file uploaded."
            )

        # 3. Analyze image features with fail-safe error propagation
        try:
            return analyze_image_features(bytes(content))
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    elif simulated_type:
        return simulate_incident_classification(simulated_type)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a photo file or simulated_type must be provided."
        )
