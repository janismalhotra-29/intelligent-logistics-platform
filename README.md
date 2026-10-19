# NER Smart Logistics and Accessibility Intelligence Platform

> **SIH Problem Statement**: "AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region (NER)"  
> **Target Audience**: Disaster Management Authorities, State Logistics Command Centers, Freight & Fleet Operators, and Field Officers across all 8 North Eastern States (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura).  
> **Repository Status**: Fully Audited, Hardened, Tested (37/37 Tests Passing), and Deployment-Ready.

---

## 1. Executive Summary & Core Philosophy

The **NER Smart Logistics and Accessibility Intelligence Platform** is **NOT** a standard turn-by-turn navigation map like Google Maps.  
While consumer consumer-grade navigation engines guide vehicles along static routes, the NER platform is a **Predictive + Real-Time GIS + AI Decision-Support Platform** explicitly engineered for the unique geomorphology of the North Eastern Region of India—a region marked by steep Himalayan slopes, torrential monsoon cloudbursts, riverbank erosion, flash floods, and single-corridor arterial choke points.

### The 5 Core Operational Questions Answered in Real-Time:
1. **Is this route currently accessible?** (🟢 ACCESSIBLE, 🟡 WATCH, 🟠 RESTRICTED, 🔴 BLOCKED)
2. **What is likely to go wrong on this route?** (Explainable AI: Rainfall +29%, Slope instability +21%, Historical slides +17%, Road drainage +11%)
3. **When could the route become inaccessible?** (Disruption Window: *Now*, *Within 1 hour*, *1–3 hours*, *3–6 hours*, *6–12 hours*, *Low probability*)
4. **If blocked or risky, what is the best alternative route?** (Multi-criteria hazard routing penalizing flood/slide risks; provides Route A vs Route B vs Route C with trade-off justification)
5. **Where are the vehicles/supplies right now, and will they reach on time?** (Live fleet GPS tracking, cold-chain medicine priority weighting, and XGBoost/Random Forest ETA delay regression)

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

## 3. System Architecture & Technical Stack

```
ner-logistics/
│
├── frontend/               # React 18 + TypeScript + Vite + Tailwind CSS + Leaflet
│   ├── src/
│   │   ├── components/     # Header, Sidebar, ScenarioModal, NERMap, KPI Cards
│   │   ├── pages/          # 9 Dedicated Platform Views (CommandCenter, RoutePlanner, etc.)
│   │   ├── services/       # REST API client & Offline Storage Sync
│   │   └── i18n/           # English & Hindi translation dictionaries
│
├── backend/                # Python 3.12 + FastAPI REST & WebSocket Gateway
│   ├── app/
│   │   ├── api/            # 12 Modular API Routers (roads, risk, eta, routes, vehicles, etc.)
│   │   ├── services/       # Accessibility Engine, Scenario Service, SQLAlchemy DataStore
│   │   ├── routing/        # NetworkX Dynamic Multi-Criteria Hazard Router
│   │   ├── alerts/         # Rule + AI Alert Engine (Normal, Watch, Warning, Critical)
│   │   ├── auth.py         # Role-Based Access Control (RBAC) & API Key Security
│   │   ├── database.py     # SQLAlchemy 2.0 Engine (PostgreSQL / PostGIS / SQLite)
│   │   └── config.py       # Pydantic Settings & Environment Validation
│
├── ml/                     # Machine Learning & Computer Vision Baseline Models
│   ├── risk_model/         # Random Forest Classifier + Feature Attribution Explainable AI
│   ├── eta_model/          # Random Forest Delay Regressor with Empirical Variation Ranges
│   └── incident_classifier/# Computer Vision Heuristic Classifier with Failure Fallbacks
│
├── tests/                  # 37 Automated Tests (Pytest + TestClient)
├── database/migrations/    # Complete PostgreSQL + PostGIS DDL Schema (15 Tables & GIST Indexes)
├── .github/workflows/      # Automated CI Workflow (Backend Tests + Frontend Build)
└── docker-compose.yml      # Hardened Multi-Container Orchestration (Secrets & Healthchecks)
```

---

## 4. Machine Learning Models & Baseline Disclosures

In accordance with responsible AI standards, all predictive models are transparently documented in [`MODEL_CARD.md`](MODEL_CARD.md):

1. **Road Risk & Disruption Classifier (`ml/risk_model/`)**:
   - Evaluates 23 topographical and meteorological features (1h, 6h, 24h, 7d rainfall, slope gradient, soil saturation, river proximity, historical slides).
   - **Trained Model:** Random Forest Classifier (100 estimators).
   - **Benchmarking:** Achieves **92.4% test accuracy (AUC: 0.975)** compared to **81.7% dummy most-frequent baseline**.
   - **Explainability:** Returns point-based feature contributions (+27 rainfall, +20 past slides, +14 slope gradient).
   - *Dataset Disclosure:* Trained on synthetic geomorphological datasets calibrated to published GSI/IMD regional mountain road data.

2. **ETA Delay Prediction Regressor (`ml/eta_model/`)**:
   - Estimates transit delay (minutes) across adverse weather, road damage, and elevation gradients.
   - **Trained Model:** Random Forest Regressor (100 estimators).
   - **Benchmarking:** Achieves **Mean Absolute Error (MAE) of 12.60 mins (R²: 0.944)** compared to **55.28 mins dummy mean baseline**.
   - **Empirical Variation:** Reports empirical residual RMSE bounds (±20.4 min variation).
   - *Dataset Disclosure:* Calibrated on synthetic convoy transits across NER arterial lifelines.

3. **Field Incident Visual Classifier (`ml/incident_classifier/`)**:
   - Color histogram and Sobel edge-density baseline analyzer for field officer photos.
   - Classifies photos into *Landslide*, *Flood*, *Road Damage*, *Bridge Damage*, or *Traffic Obstruction*.
   - *Failure Handling:* Malformed, corrupt, or unparseable images return clean `UNPROCESSED` status with descriptive error without fabricating false landslides.

---

## 5. End-to-End Signature Demo Scenario: "North Sikkim Landslide Drill"

The platform features an interactive **Simulation Drill Controller** accessible from the top navigation bar:

1. **Step 1 — Baseline Operation**: Convoy V-102 carrying Emergency Medicine (Insulin & Trauma Kits, Priority 100) departs Gangtok for Mangan Forward Base via NH-310A. Normal ETA: 4h 20m, Risk: 32%.
2. **Step 2 — Heavy Rainfall Event**: Downpour escalates to 142 mm/24h in Mangan catchment. Road enters **WATCH** advisory, risk climbs to 68%, delay projection increases to +48 min.
3. **Step 3 — Landslide Field Verification**: Field Officer confirms massive debris slide at Mile-14. NH-310A marked 🔴 **BLOCKED**. Risk hits 91%. Impact analysis flags 6 stranded convoys and 2 critical medicine shipments. Critical Alert fires.
4. **Step 4 — Automated Rerouting via Route B**: Routing engine calculates the Dikchu Western Bypass (Route B: +18 km, +42 min, Risk 24%). Operator confirms diversion. Vehicle V-102 reroutes to Route B, safely ensuring cold-chain survival.

---

## 6. Local Setup Instructions

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ and npm
- (Optional) Docker & Docker Compose

### 1. Backend Setup (Native Virtual Environment)
```bash
# 1. Install dependencies:
pip install -r requirements.txt

# 2. Configure environment:
cp .env.example .env
# (Optional: customize ADMIN_API_KEY, PORT, or DATABASE_URL in .env)

# 3. Train ML models and seed baseline datasets:
python ml/risk_model/train_and_predict.py
python ml/eta_model/train_and_predict.py
python backend/app/seed_generator.py

# 4. Start the FastAPI backend:
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive OpenAPI documentation will be accessible at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup (React + Vite)
```bash
# In frontend/ directory:
cd frontend
npm install

# Start development server:
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Docker Compose Setup (Full Multi-Container Stack)
```bash
# Launch database, backend, and frontend containers:
docker compose up -d --build

# Verify running health:
docker compose ps
```
- Frontend UI: `http://localhost:3000`
- Backend API & Health Check: `http://localhost:8000/health`
- Swagger Docs: `http://localhost:8000/docs`

---

## 7. Verification & Automated Test Suite

The platform includes a comprehensive 37-test automated pytest suite:

```bash
# Execute full backend test suite:
python -m pytest -v

# Execute frontend production build test:
cd frontend && npm run build
```

Detailed test logs and chunk optimization metrics are documented in [`TEST_REPORT.md`](TEST_REPORT.md).

---

## 8. Technical Documentation Index

- [`AUDIT_REPORT.md`](AUDIT_REPORT.md) — Comprehensive baseline audit, vulnerability registry, and verification status for all 22 findings.
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — Production cloud hosting guide (Vercel + Render/Railway + Supabase PostGIS) and database disaster recovery procedures.
- [`MODEL_CARD.md`](MODEL_CARD.md) — Detailed AI/ML model documentation, feature importance, baseline comparisons, and dataset transparency disclosures.
- [`SECURITY.md`](SECURITY.md) — Threat model, RBAC policies, secret management, upload protections, and vulnerability reporting.
- [`TEST_REPORT.md`](TEST_REPORT.md) — Full test run results, coverage breakdown, and Vite production bundle analysis.

---

## 9. Multilingual Support & Team Attribution

- **Multilingual UI:** Seamless toggle between **English** and **Hindi** via the header language selector.
- **Team Attribution:** Built for the Smart India Hackathon (SIH) by the original project engineering team. All baseline research, regional corridor mappings, and architectural designs are preserved with complete authorship attribution.
