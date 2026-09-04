"""
AI ETA and Delay Prediction API router.
Serves Normal ETA, Predicted Delay, Total Predicted ETA, and uncertainty intervals.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from ml.eta_model.train_and_predict import predict_eta

router = APIRouter(prefix="/api/eta", tags=["AI ETA"])

class ETAPredictionRequest(BaseModel):
    distance_km: float = Field(default=85.0, description="Transit distance in km")
    base_speed_kmh: float = Field(default=35.0, description="Baseline cruising speed in km/h")
    road_condition_score: int = Field(default=3, description="1 to 5")
    traffic_level_idx: int = Field(default=1, description="0 to 3")
    rainfall_24h_mm: float = Field(default=45.0, description="24h rainfall in mm")
    elevation_m: float = Field(default=1400.0, description="Elevation in meters")
    slope_deg: float = Field(default=22.0, description="Road slope in degrees")
    route_risk_score: float = Field(default=40.0, description="Overall route risk 0-100")
    historical_avg_speed_kmh: float = Field(default=32.0, description="Historical average speed")
    time_of_day_hour: int = Field(default=10, description="0 to 23")
    is_weekend: int = Field(default=0, description="0 or 1")
    active_closures_count: int = Field(default=0, description="Number of active roadblocks")
    vehicle_type_idx: int = Field(default=0, description="0: Light 4x4, 1: Heavy, 2: Cold-Chain, 3: Escort")

@router.post("/predict")
def predict_trip_eta(request: ETAPredictionRequest):
    """
    Predict Normal ETA, Expected Delay, and Predicted Total ETA with confidence range.
    """
    result = predict_eta(request.model_dump())
    return result
