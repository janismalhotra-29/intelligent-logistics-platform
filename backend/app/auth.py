"""
Role-Based Access Control and API Key Authentication Module.
Protects sensitive operational mutation, diversion, and reset endpoints.
"""

from typing import Optional
from fastapi import Header, HTTPException, status, Depends
from backend.app.config import settings

VALID_ROLES = {"COMMAND_CENTER", "LOGISTICS_OPERATOR", "FIELD_OFFICER", "ADMIN"}


def verify_api_key(
    x_api_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)
) -> bool:
    """
    Validate provided API key against configured ADMIN_API_KEY.
    Supports either X-API-Key header or Authorization: Bearer <token>.
    """
    token = None
    if x_api_key:
        token = x_api_key.strip()
    elif authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()

    # In development mode, allow requests with a default fallback if unconfigured
    if not settings.is_production() and not token:
        return True

    if token and token == settings.ADMIN_API_KEY:
        return True

    return False


def require_admin(
    x_api_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None)
):
    """
    Dependency requiring Administrator or Command Center privilege.
    Used for scenario resets, system configuration, and bulk data mutations.
    """
    # Check API key first
    if verify_api_key(x_api_key, authorization):
        return {"role": "ADMIN", "authenticated": True}

    # Allow Command Center or Admin role in development / demo mode
    if not settings.is_production():
        if x_user_role in ("COMMAND_CENTER", "ADMIN"):
            return {"role": x_user_role, "authenticated": True}
        # In non-production demo mode without headers, permit with demo tag
        return {"role": "DEMO_OPERATOR", "authenticated": False}

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized: Admin or Command Center authentication credentials required."
    )


def require_operator_or_officer(
    x_api_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None)
):
    """
    Dependency for convoy diversion, incident reporting, and field telemetry uploads.
    Accepts COMMAND_CENTER, LOGISTICS_OPERATOR, FIELD_OFFICER, or ADMIN.
    """
    if verify_api_key(x_api_key, authorization):
        return {"role": "ADMIN", "authenticated": True}

    role = (x_user_role or "").upper()
    if role in VALID_ROLES:
        return {"role": role, "authenticated": True}

    if not settings.is_production():
        return {"role": "DEMO_OPERATOR", "authenticated": False}

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden: Logistics Operator, Field Officer, or Command Center role required."
    )
