"""
NER Smart Logistics Intelligence Platform - FastAPI Main Application.
Decision-support system for road accessibility, AI risk prediction, ETA modeling,
dynamic hazard routing, fleet tracking, and field incident reporting for the North Eastern Region.
"""

import asyncio
import json
import logging
import time
import uuid
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.roads import router as roads_router
from backend.app.api.risk import router as risk_router
from backend.app.api.eta import router as eta_router
from backend.app.api.routes import router as routes_router
from backend.app.api.vehicles import router as vehicles_router
from backend.app.api.shipments import router as shipments_router
from backend.app.api.incidents import router as incidents_router
from backend.app.api.field_reports import router as field_reports_router
from backend.app.api.weather import router as weather_router
from backend.app.api.alerts import router as alerts_router
from backend.app.api.scenario import router as scenario_router
from backend.app.services.data_store import store

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ner_logistics")

app = FastAPI(
    title="NER Smart Logistics Intelligence Platform",
    description="AI-Powered Logistics Decision-Support System for the North Eastern Region (NER) of India",
    version="2.0.0"
)

# Observability middleware: inject correlation ID and log structured request telemetry
@app.middleware("http")
async def observability_middleware(request: Request, call_next):
    correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
    request.state.correlation_id = correlation_id
    start_time = time.time()
    
    try:
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000
        response.headers["X-Correlation-ID"] = correlation_id
        logger.info(
            f"[{correlation_id[:8]}] {request.method} {request.url.path} -> {response.status_code} ({duration_ms:.1f}ms)"
        )
        return response
    except Exception as exc:
        duration_ms = (time.time() - start_time) * 1000
        logger.error(
            f"[{correlation_id[:8]}] Unhandled error on {request.method} {request.url.path} ({duration_ms:.1f}ms): {exc}",
            exc_info=True
        )
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error. Reference correlation ID for support.",
                "correlation_id": correlation_id
            },
            headers={"X-Correlation-ID": correlation_id}
        )

# CORS configuration: strict explicit origins loaded from configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=600
)

# Mount all API routers
app.include_router(dashboard_router)
app.include_router(roads_router)
app.include_router(risk_router)
app.include_router(eta_router)
app.include_router(routes_router)
app.include_router(vehicles_router)
app.include_router(shipments_router)
app.include_router(incidents_router)
app.include_router(field_reports_router)
app.include_router(weather_router)
app.include_router(alerts_router)
app.include_router(scenario_router)


@app.get("/health")
def health_check():
    """
    Application health and dependency readiness probe.
    Reports operational status without exposing raw database connection credentials.
    """
    db_status = "OPERATIONAL" if hasattr(store, "roads") and len(store.roads) > 0 else "DEGRADED"
    ml_status = "LOADED"
    
    return {
        "status": "HEALTHY" if db_status == "OPERATIONAL" else "DEGRADED",
        "service": "NER Smart Logistics Intelligence Platform API",
        "environment": settings.ENVIRONMENT,
        "database": settings.get_safe_db_summary(),
        "database_status": db_status,
        "ml_engine": ml_status,
        "coverage": "All 8 States (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura)",
        "active_scenario_step": getattr(store, "active_scenario_step", 1)
    }


# Active WebSocket connections manager with bounded limits
class ConnectionManager:
    def __init__(self, max_connections: int = 100):
        self.active_connections: list[WebSocket] = []
        self.max_connections = max_connections

    async def connect(self, websocket: WebSocket) -> bool:
        if len(self.active_connections) >= self.max_connections:
            await websocket.close(code=1008, reason="Max WebSocket connection limit reached")
            return False
        await websocket.accept()
        self.active_connections.append(websocket)
        return True

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        payload = json.dumps(message)
        for connection in list(self.active_connections):
            try:
                await connection.send_text(payload)
            except Exception:
                self.disconnect(connection)


manager = ConnectionManager(max_connections=50)


@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    """
    Live stream for fleet telemetry pings, alert broadcasts, and scenario events.
    Includes connection limiting, safe disconnect handling, and bounded messaging.
    """
    connected = await manager.connect(websocket)
    if not connected:
        return

    try:
        # Send initial snapshot
        await websocket.send_text(json.dumps({
            "type": "INITIAL_STATE",
            "vehicles": store.vehicles,
            "alerts": store.alerts[:3],
            "step": getattr(store, "active_scenario_step", 1)
        }))
        while True:
            # Keep socket alive and accept ping commands with size limit
            data = await websocket.receive_text()
            if len(data) > 1024:
                continue
            try:
                msg = json.loads(data)
                if msg.get("action") == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
