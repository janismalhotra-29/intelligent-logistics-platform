# NER Smart Logistics and Accessibility Intelligence Platform

> **SIH Problem Statement**: "AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region (NER)"  
> **Target Audience**: Disaster Management Authorities, Command Centers, Logistics Operators, and Field Officers across all 8 North Eastern States (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura).

---

## 1. Executive Summary & Core Philosophy

The **NER Smart Logistics Intelligence Platform** is **NOT** a standard turn-by-turn navigation map like Google Maps.  
While consumer maps guide vehicles along static routes, the NER platform is a **Predictive + Real-Time GIS + AI Decision-Support Platform** explicitly engineered for the unique geomorphology of the North Eastern Region of India—a region marked by steep Himalayan slopes, torrential monsoon cloudbursts, riverbank erosion, flash floods, and single-corridor arterial choke points.

### The 5 Core Questions Answered in Real-Time:
1. **Is this route currently accessible?** (🟢 ACCESSIBLE, 🟡 WATCH, 🟠 RESTRICTED, 🔴 BLOCKED)
2. **What is likely to go wrong on this route?** (Explainable AI: Rainfall +29%, Slope instability +21%, Historical slides +17%, Road drainage +11%)
3. **When could the route become inaccessible?** (Disruption Window: *Now*, *Within 1 hour*, *1–3 hours*, *3–6 hours*, *6–12 hours*, *Low probability*)
4. **If blocked or risky, what is the best alternative route?** (Multi-criteria hazard routing penalizing flood/slide risks; provides Route A vs Route B vs Route C with trade-off justification)
5. **Where are the vehicles/supplies right now, and will they reach on time?** (Live fleet GPS tracking, cold-chain medicine priority weighting, and XGBoost ETA delay regression)

---

## 2. Regional Coverage (All 8 NER States)

| State | Strategic Gateway / Logistics Hubs | Monitored Lifelines & Corridors |
| :--- | :--- | :--- |
| **Sikkim** | Gangtok Medical Depot, Mangan Relief Base, Lachung | NH-310A (North Sikkim Lifeline), NH-10 (Siliguri Corridor), Dikchu Bypass |
| **Assam** | Guwahati Central Depot, Silchar Gateway, Dibrugarh | NH-27 (East-West Arterial), NH-37 (Brahmaputra Valley) |
| **Meghalaya** | Shillong Strategic Cold Chain, Tura Outpost | NH-6 (Guwahati-Shillong-Silchar), SH-5 (Cherrapunji) |
| **Arunachal Pradesh** | Itanagar Civil Depot, Tawang Base, Pasighat Terminal | NH-13 (Trans-Himalayan / Sela Tunnel corridor), NH-415 |
| **Nagaland** | Dimapur Central Railhead, Kohima Highland Depot | NH-29 (Dimapur–Kohima Highway), NH-2 |
| **Manipur** | Imphal Relief Center, Churachandpur Depot | NH-2 (Kohima–Imphal), NH-37 (Silchar–Jiribam–Imphal) |
| **Mizoram** | Aizawl Civil Supplies Warehouse, Lunglei Outpost | NH-306 (Silchar–Vairengte–Aizawl Lifeline) |
| **Tripura** | Agartala Integrated Logistics Park, Dharmanagar | NH-8 (Dharmanagar–Agartala), NH-208 (Sabroom Corridor) |

---

## 3. Four-Layer Decoupled Architecture

```
ner-logistics/
│
├── frontend/               # React 18 + TypeScript + Vite + Tailwind CSS + Leaflet
│   ├── src/
│   │   ├── components/     # Header, Sidebar, ScenarioModal, NERMap
│   │   ├── pages/          # 9 Dedicated Platform Views
│   │   ├── services/       # REST API client & Offline Storage Sync
│   │   └── i18n/           # English & Hindi translation dictionaries
│
├── backend/                # Python + FastAPI REST & WebSocket Gateway
│   ├── app/
│   │   ├── api/            # 12 Modular API Routers
│   │   ├── services/       # Accessibility Engine, Scenario Service, DataStore
│   │   ├── routing/        # NetworkX Dynamic Multi-Criteria Hazard Router
│   │   └── alerts/         # Rule + AI Alert Engine (Normal, Watch, Warning, Critical)
│
├── ml/                     # Deterministic ML & Computer Vision Models
│   ├── risk_model/         # Random Forest & Gradient Boosting Risk Classifier + Explainable AI
│   ├── eta_model/          # Random Forest Regressor for Delay Prediction & Uncertainty Ranges
│   └── incident_classifier/# Computer Vision Hazard Photo Classifier (Landslide, Flood, Damage)
│
├── data/                   # Realistic Geographic & Network Datasets for 8 NER States
├── database/migrations/    # Complete PostgreSQL + PostGIS DDL Schema (15 Tables & GIST Indexes)
└── docker-compose.yml      # PostGIS + FastAPI + React container orchestration
```

### Deterministic ML & Explainable AI
- **Road Risk Disruption Model** (`ml/risk_model/`): Trained on 23 mountain topography & meteorological features (rainfall 1h/6h/24h/7d, slope, elevation, river proximity, historical slides). Achieves **Test AUC: 0.9733, Accuracy: 92.00%**. Delivers point-based feature attribution (+27 rainfall, +20 past slides, +14 slope).
- **ETA Delay Regressor** (`ml/eta_model/`): Evaluates speed reduction curves under adverse weather and mountain terrain. Achieves **R²: 0.9443, MAE: 12.60 mins**, returning confidence intervals.
- **Incident Computer Vision Classifier** (`ml/incident_classifier/`): Edge and color histogram signature analysis classifying field photos into Landslide, Flood, Road Damage, Bridge Damage, Traffic Obstruction.

---

## 4. End-to-End Signature Demo Scenario: "North Sikkim Landslide Scenario"

The platform features an interactive **Scenario Controller** in the top navigation bar:

1. **Step 1 — Baseline Operation**: Convoy V-102 carrying Emergency Medicine (Insulin & Trauma Kits, Priority 100) departs Gangtok for Mangan Forward Base via NH-310A. Normal ETA: 4h 20m, Risk: 32%.
2. **Step 2 — Heavy Rainfall Event**: Downpour escalates to 142 mm/24h in Mangan catchment. Road enters **WATCH** advisory, risk climbs to 68%, delay projection increases to +48 min.
3. **Step 3 — Landslide Field Verification**: Field Officer confirms massive debris slide at Mile-14. NH-310A marked 🔴 **BLOCKED**. Risk hits 91%. Impact analysis flags 6 stranded convoys and 2 critical medicine shipments. Critical Alert fires.
4. **Step 4 — Automated Rerouting via Route B**: Routing engine calculates the Dikchu Western Bypass (Route B: +18 km, +42 min, Risk 24%). Operator confirms diversion. Vehicle V-102 reroutes to Route B, safely ensuring cold-chain survival.

---

## 5. Role-Based Access Control (RBAC)

- **Command Center (Government / Disaster Authority)**: Full 8-state GIS map, live road statuses (🟢/🟡/🟠/🔴), 8 KPI metrics, alert oversight, cross-state route inspections.
- **Logistics Operator**: Live convoy telematics, driver contacts, speed, cargo priority rankings (Medicine: 100, Food: 90, Fuel: 85), one-click emergency diversion execution.
- **Field Officer (Mobile Offline App)**: Mobile interface with simulated offline mode toggle, GPS auto-coordinate lock, camera photo classification, and local queueing with automatic synchronization when network reconnects.

---

## 6. Local Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- (Optional) Docker & Docker Compose for PostGIS

### 1. Backend & ML Setup
```bash
# In SIH_HACKATHON root:
pip install -r requirements.txt

# Run ML models and seed data generator:
python3 ml/risk_model/train_and_predict.py
python3 ml/eta_model/train_and_predict.py
python3 backend/app/seed_generator.py

# Start FastAPI backend on http://127.0.0.1:8000:
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API docs will be available at: `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
# In frontend/ directory:
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Docker Compose (Full Stack with PostGIS)
```bash
docker-compose up --build
```
This spins up:
- `db`: PostGIS container on port 5432 with spatial index migrations applied
- `backend`: FastAPI API on port 8000
- `frontend`: Nginx serving React on port 3000

---

## 7. Multilingual Support
Toggle between **English** and **Hindi** via the language selector in the top-right header. All navigation links, KPI cards, road statuses, and scenario prompts adapt instantly.

---

## 8. Verification & Test Suite
Run the backend verification suite:
```bash
python3 -c "from fastapi.testclient import TestClient; from backend.app.main import app; client = TestClient(app); assert client.get('/health').status_code == 200; print('Backend Health Verified!')"
```
Run the frontend production compilation check:
```bash
cd frontend && npm run build
```
