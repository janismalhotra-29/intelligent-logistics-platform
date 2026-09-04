"""
AI Risk Prediction API router.
Serves road disruption risk probabilities (0-100%), sub-risks,
disruption window time estimates, and Explainable AI factor contributions.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from ml.risk_model.train_and_predict import predict_road_risk

router = APIRouter(prefix="/api/risk", tags=["AI Risk"])

class RiskPredictionRequest(BaseModel):
    rainfall_1h: float = Field(default=10.0, description="1-hour rainfall in mm")
    rainfall_6h: float = Field(default=35.0, description="6-hour rainfall in mm")
    rainfall_24h: float = Field(default=80.0, description="24-hour rainfall in mm")
    rainfall_7d: float = Field(default=220.0, description="7-day cumulative rainfall in mm")
    forecast_rainfall: float = Field(default=45.0, description="Forecast rainfall in mm")
    temperature: float = Field(default=22.0, description="Ambient temperature in Celsius")
    humidity: float = Field(default=85.0, description="Relative humidity in %")
    wind_speed: float = Field(default=12.0, description="Wind speed in km/h")
    elevation: float = Field(default=1200.0, description="Elevation in meters")
    slope: float = Field(default=25.0, description="Terrain slope in degrees")
    road_type_idx: int = Field(default=0, description="0: NH, 1: SH, 2: Border, 3: Rural")
    road_surface_idx: int = Field(default=0, description="0: Asphalt, 1: Bituminous, 2: Gravel")
    road_condition_score: int = Field(default=3, description="1 (Critical) to 5 (Excellent)")
    traffic_level_idx: int = Field(default=1, description="0: Low, 1: Moderate, 2: High, 3: Heavy")
    river_proximity_m: float = Field(default=250.0, description="Distance to river course in meters")
    historical_landslides: int = Field(default=2, description="Past landslide incidents")
    historical_floods: int = Field(default=0, description="Past flood incidents")
    historical_incidents: int = Field(default=2, description="Total historical incidents")
    bridge_condition_score: int = Field(default=4, description="1 to 5")
    recent_field_reports_count: int = Field(default=0, description="Reports in past 48h")
    distance_to_hazard_m: float = Field(default=800.0, description="Distance to nearest active hazard")
    incident_count_30d: int = Field(default=1, description="30-day incident count")
    incident_count_90d: int = Field(default=3, description="90-day incident count")
    is_currently_blocked: bool = Field(default=False, description="Physical blockage active")

@router.post("/predict")
def predict_risk(request: RiskPredictionRequest):
    """
    Predict road disruption risk, sub-risks, and Explainable AI factor contributions.
    """
    result = predict_road_risk(request.model_dump())
    return result
