"""
NER Smart Logistics Intelligence Platform - FastAPI Main Application.
Decision-support system for road accessibility, AI risk prediction, ETA modeling,
dynamic hazard routing, fleet tracking, and field incident reporting for the North Eastern Region.
"""

import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

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

app = FastAPI(
    title="NER Smart Logistics Intelligence Platform",
    description="AI-Powered Logistics Decision-Support System for the North Eastern Region (NER) of India",
    version="2.0.0"
)

# CORS configuration for development & production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    return {
        "status": "HEALTHY",
        "service": "NER Smart Logistics Intelligence Platform API",
        "coverage": "All 8 States (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura)",
        "active_scenario_step": getattr(store, "active_scenario_step", 1)
    }

# Active WebSocket connections manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    """
    Live stream for fleet telemetry pings, alert broadcasts, and scenario events.
    """
    await manager.connect(websocket)
    try:
        # Send initial snapshot
        await websocket.send_text(json.dumps({
            "type": "INITIAL_STATE",
            "vehicles": store.vehicles,
            "alerts": store.alerts[:3],
            "step": getattr(store, "active_scenario_step", 1)
        }))
        while True:
            # Keep socket alive and accept ping commands
            data = await websocket.receive_text()
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
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
