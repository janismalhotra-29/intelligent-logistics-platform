"""
Scenario Demonstration API router.
Drives the North Sikkim Landslide end-to-end interactive demonstration workflow.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from backend.app.services.scenario_service import execute_scenario_step, get_scenario_status
from backend.app.services.data_store import store

router = APIRouter(prefix="/api/scenario", tags=["Scenario Demonstration"])

class StepRequest(BaseModel):
    step: int = Field(default=1, description="Step number (1 to 4)")
    vehicle_id: str = Field(default="V-102", description="Vehicle ID to simulate on")

@router.get("/status")
def status():
    """Get active scenario state."""
    return get_scenario_status()

@router.post("/step")
def set_step(payload: StepRequest):
    """Transition to specific step in the disaster drill for the chosen convoy."""
    return execute_scenario_step(payload.step, payload.vehicle_id)

@router.post("/reset")
def reset():
    """Reset full system state to Step 1 baseline."""
    store.reset_all()
    return execute_scenario_step(1, "V-102")

