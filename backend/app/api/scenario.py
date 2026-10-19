"""
Scenario Demonstration API router.
Drives the North Sikkim Landslide end-to-end interactive demonstration workflow.
Protected by role-based access control and rate-conscious parameter validation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from backend.app.services.scenario_service import execute_scenario_step, get_scenario_status
from backend.app.services.data_store import store
from backend.app.auth import require_admin, require_operator_or_officer

router = APIRouter(prefix="/api/scenario", tags=["Scenario Demonstration"])


class StepRequest(BaseModel):
    step: int = Field(default=1, ge=1, le=4, description="Step number (1 to 4)")
    vehicle_id: str = Field(default="V-102", max_length=20, description="Vehicle ID to simulate on")


@router.get("/status")
def status():
    """Get active scenario state."""
    return get_scenario_status()


@router.post("/step")
def set_step(
    payload: StepRequest,
    auth: dict = Depends(require_operator_or_officer)
):
    """
    Transition to specific step in the disaster drill for the chosen convoy.
    Requires Operator, Officer, or Admin credentials.
    """
    return execute_scenario_step(payload.step, payload.vehicle_id)


@router.post("/reset")
def reset(
    auth: dict = Depends(require_admin)
):
    """
    Reset full system state to Step 1 baseline.
    Requires Administrator or Command Center role.
    """
    store.reset_all()
    return execute_scenario_step(1, "V-102")
