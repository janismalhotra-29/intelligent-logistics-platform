# AUDIT REPORT: NER Smart Logistics and Accessibility Intelligence Platform

**Date:** October 19, 2026  
**Auditors:** Senior Software Engineer, Cybersecurity Engineer, ML Engineer, DevOps & QA Engineer  
**Baseline Commit:** `32821fb` ("Initial commit of provided project baseline")  
**Scope:** Full-stack codebase audit (Backend, Frontend, ML models, Database, Docker, Configuration, Security, Testing)

---

## 1. Executive Summary

An exhaustive baseline audit of the **NER Smart Logistics and Accessibility Intelligence Platform** was conducted across all files, configuration, build systems, ML pipelines, and API services.

The platform has a strong conceptual foundation, comprehensive GIS data structures for all 8 North Eastern States (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura), and an interactive UI. However, critical vulnerabilities, data persistence omissions, security risks, and ML fidelity issues were discovered that prevent secure and reliable deployment:

1. **Active Hardcoded Credentials:** Plaintext PostgreSQL passwords and connection strings are exposed in `docker-compose.yml`.
2. **Critical Security Flaws:** Insecure CORS (`allow_origins=["*"]` + `allow_credentials=True`), disabled TLS certificate validation (`ssl._create_unverified_context()`), unbounded photo uploads, and unprotected mutating/reset endpoints.
3. **Data Persistence Disconnect:** Despite a PostgreSQL/PostGIS database schema and container, the FastAPI backend relies exclusively on an in-memory mutable singleton (`DataStore`), losing all state across restarts.
4. **AI/ML Fidelity & Transparency Issues:** Image classification relies on edge/color heuristics with fabricated landslide fallbacks and boosted confidence scores. Synthetic training sets are not transparently labelled as prototypes.
5. **Zero Automated Test Coverage:** No automated pytest test suite was implemented; initial pytest execution collected 0 tests.
6. **Missing Dependencies & Deployment Configuration:** `networkx`, `psycopg2-binary`, and `xgboost` were absent from environment; frontend lacked flexible API base URL configuration for distributed hosting (Vercel + Render).

---

## 2. Baseline Verification Results (Pre-Fix)

| Check / Command | Result | Evidence / Notes |
| :--- | :--- | :--- |
| `npm run build` (Frontend) | **PASS** | Built in 7.49s; warning regarding chunks >500 kB (922 kB bundle). |
| `python -m pytest` | **FAIL (Zero Tests)** | Exited with code 1; collected 0 items. No tests existed. |
| `python -c "TestClient(app)..."` (Health Check) | **FAIL** | Failed initially with `ModuleNotFoundError: No module named 'networkx'`. Succeeded only after missing packages installed. |
| `python ml/risk_model/train_and_predict.py` | **PASS (Synthetic)** | Trains Random Forest on 5,000 synthetic samples (Test AUC: 0.9733). |
| `python ml/eta_model/train_and_predict.py` | **PASS (Synthetic)** | Trains Random Forest Regressor on 5,000 synthetic samples (R²: 0.9443). |
| `python backend/app/seed_generator.py` | **PASS** | Generated 23 roads, 19 hubs, 6 vehicles in JSON format. |
| Docker Compose Security Check | **FAIL** | Plaintext credentials in `docker-compose.yml`, public port 5432 exposure. |

---

## 3. Detailed Audit Findings Registry

| Finding ID | Severity | File & Location | Evidence & Impact | Proposed Correction | Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | **Critical** | `docker-compose.yml:11,30` | `POSTGRES_PASSWORD: ner_secure_password_2026` and `DATABASE_URL` hardcoded in plaintext. Credentials exposed in version control. | Externalize database credentials into `.env` file; create `.env.example`; add startup environment validation. | Verify `.env` is git-ignored, `.env.example` has placeholders, and backend starts with environment variables. | **Open** |
| **SEC-02** | **Critical** | `backend/app/main.py:34-40` | `allow_origins=["*"]` combined with `allow_credentials=True`. Violates CORS specification; browsers reject credentialed requests with wildcard origin; vulnerable to CSRF/data leakage. | Configure explicit origin whitelist loaded from `FRONTEND_ORIGIN` environment variable; separate dev and prod CORS profiles. | Automated test asserting origins are validated and wildcard + credentials combination is removed. | **Open** |
| **SEC-03** | **Critical** | `backend/app/services/live_weather_service.py:121` | `self._ssl_context = ssl._create_unverified_context()` disables TLS certificate verification. Vulnerable to Man-in-the-Middle (MitM) attacks. | Remove unverified context; use standard certificate verification with default TLS context; add timeouts, bounded retries, and error handling. | Unit test verifying SSL context enforces verification and timeout handling. | **Open** |
| **SEC-04** | **High** | `backend/app/api/incidents.py:57-74` | `await file.read()` reads unbounded upload into memory. No MIME validation, file signature check, or size limits. Unhandled exceptions default to fake Landslide. | Enforce file size limit (max 5 MB), validate MIME type / Magic bytes (JPEG, PNG, WebP), generate server-side unique filenames, and return proper HTTP 400/413 errors. | Automated upload tests with oversized (>5MB) files, spoofed extensions, and malformed images. | **Open** |
| **SEC-05** | **High** | `backend/app/api/scenario.py:23-32` and `backend/app/api/vehicles.py:31-36` | `POST /api/scenario/reset`, `/step`, and `/divert` have zero authorization or role checks. Malicious actors or public users can reset and mutate operations. | Introduce API Key / RBAC authentication middleware protecting administrative, scenario mutation, and vehicle diversion endpoints. | Automated tests verifying HTTP 401/403 when unauthenticated, HTTP 200 with valid credentials. | **Open** |
| **SEC-06** | **High** | `backend/app/api/field_reports.py:31-45` | `BatchSyncRequest` accepts unbounded reports without batch limit, string length limits, coordinate boundary checks, or duplicate suppression. | Add max batch size (e.g. 50 items), validate coordinate ranges to NER geographic bounds, enforce string length constraints, and implement deduplication by `client_uuid`. | Automated tests sending duplicate `client_uuid`, oversized batches, and out-of-bound coordinates. | **Open** |
| **SEC-07** | **Medium** | `backend/Dockerfile:1-26` | Process runs as `root` user in container; database port `5432:5432` exposed publicly to host in `docker-compose.yml`. | Add non-root system user (`appuser`) in Dockerfile; restrict PostgreSQL port binding to internal Docker network or `127.0.0.1`. | Inspect Dockerfile structure and verify non-root user execution. | **Open** |
| **ARCH-01** | **Critical** | `backend/app/services/data_store.py:25-52` | `DataStore` stores all state in in-memory Python lists. No connection to PostgreSQL/PostGIS. All updates, incidents, and field reports lost on restart. | Implement hybrid persistence layer with SQLAlchemy 2.0 ORM: support PostgreSQL with automatic fallback to persistent SQLite/in-memory for standalone demo, maintaining data across restarts. | Restart backend process and assert previously added incidents/reports persist. | **Open** |
| **ARCH-02** | **High** | `backend/app/main.py:56-64` | `/health` endpoint returns hardcoded `"status": "HEALTHY"` without verifying database connectivity or ML model availability. | Implement true readiness/liveness checks querying DB connection and ML model readiness. | Test `/health` when database is connected vs degraded. | **Open** |
| **ARCH-03** | **Medium** | `backend/app/api/dashboard.py:39-48` | `state_breakdown` hardcodes road vulnerability counts (`"Sikkim": {"total": 5...}`) rather than querying active roads. | Compute state vulnerability dynamically from stored road records. | Unit test verifying dashboard values update when road statuses change. | **Open** |
| **ARCH-04** | **Medium** | `backend/app/alerts/alert_engine.py:80-81` | `affected_vehicles` and `critical_shipments` force values to `6` and `2` for road `R-1024` via hardcoded `max()` logic. | Query vehicles and shipments assigned to the affected corridor dynamically. | Unit test verifying affected counts match actual vehicle and shipment corridor assignments. | **Open** |
| **ARCH-05** | **Low** | `backend/app/api/roads.py:13-17`, `incidents.py:24-27` | List endpoints return all records without limit/offset pagination or sorting options. | Add query parameters `limit: int = 50`, `offset: int = 0` with validation. | API tests verifying pagination boundaries. | **Open** |
| **FE-01** | **High** | `frontend/src/services/api.ts:3` | `const API_BASE = '/api'` hardcoded. Direct deployment to Vercel fails to connect to external backend API (e.g., Render/Railway). | Use `import.meta.env.VITE_API_BASE_URL || '/api'`; document configuration in `.env.example`. | Verify frontend builds and uses custom API URL when provided. | **Open** |
| **FE-02** | **Medium** | `frontend/src/App.tsx`, `SimulationDrill.tsx` | WebSocket URL hardcoded to relative path without SSL detection (`ws://` vs `wss://`). Disconnects lack exponential backoff. | Implement dynamic WebSocket URL helper resolving `window.location.protocol === 'https:' ? 'wss:' : 'ws:'` with reconnect backoff. | Test WebSocket connection under HTTPS and HTTP environments. | **Open** |
| **FE-03** | **Medium** | `frontend/src/pages/FieldOfficerApp.tsx:91` | `state: 'Sikkim'` hardcoded for all field reports submitted through mobile interface. | Derive `state` dynamically from the selected road's state metadata. | Submit report for Assam/Meghalaya road and verify recorded state matches. | **Open** |
| **FE-04** | **Low** | `frontend/vite.config.ts` | Bundle warning: chunks exceed 500 kB (922 kB bundle). Monolithic load of Recharts/Leaflet. | Configure `build.rollupOptions.output.manualChunks` for vendor splitting. | Run `npm run build` and verify chunks are partitioned under 500 kB. | **Open** |
| **ML-01** | **High** | `ml/incident_classifier/classify.py:78-100` | Edge/color heuristic disguised as CV model. Fabricates Landslide prediction on exceptions; boosts confidence artificially with `max(82, min(97, confidence))`. | Transparently label as heuristic baseline classifier prototype; remove fake random confidence; on failure, return `"UNKNOWN"` / `"UNPROCESSED"` with descriptive error. | Unit test passing corrupt image and asserting failure produces clean error, not fake landslide. | **Open** |
| **ML-02** | **Medium** | `ml/risk_model/train_and_predict.py:44-135` | 100% synthetic dataset claimed as predictive model without explicit prototype labelling; no baseline model comparison or confusion matrix. | Explicitly document synthetic prototype status in `MODEL_CARD.md` and code; add dummy/heuristic baseline comparison, precision, recall, and confusion matrix reporting. | Run evaluation script and verify baseline comparison is printed. | **Open** |
| **ML-03** | **Medium** | `ml/eta_model/train_and_predict.py:163-177` | Heuristic uncertainty range `margin = max(12.0, delay * 0.20)` presented as "confidence range" without calibration. | Rename to "estimated variation range" or calculate empirical standard error from residual test errors; disclose calibration limitations. | Verify prediction schema uses accurate statistical terminology. | **Open** |
| **ML-04** | **Medium** | `backend/app/routing/hazard_router.py:272-303` | On disconnected graph or path exception, generates a synthetic `dummy_route` marked as `RECOMMENDED`. | Return `None` / empty route with explicit `NO_ROUTE_FOUND` error status when destination is unreachable or graph is disconnected. | Test pathfinding on disconnected node and assert no fake route is generated. | **Open** |
| **TEST-01** | **High** | Entire repository | Zero automated tests in repository. Pre-fix `pytest` ran 0 tests. | Build comprehensive pytest test suite covering unit, API, security, routing, ML, and persistence tests. | Execute `pytest` and verify 100% pass rate. | **Open** |
| **CI-01** | **Medium** | `.github/workflows/` | No GitHub Actions CI workflow to run tests and builds on push/PR. | Create `.github/workflows/ci.yml` running backend tests and frontend build. | Inspect workflow file and validate GitHub Actions syntax. | **Open** |

---

## 4. Phase-by-Phase Remediation Roadmap

1. **Phase 2 — Security Hardening:** Fix SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06, SEC-07.
2. **Phase 3 — Backend Correctness and Persistence:** Fix ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05.
3. **Phase 4 — Frontend and API Integration:** Fix FE-01, FE-02, FE-03, FE-04.
4. **Phase 5 — AI/ML Validation and Correctness:** Fix ML-01, ML-02, ML-03, ML-04.
5. **Phase 6 — Routing, Weather, and Live Data:** Deterministic routing tests, weather retry/fallback honesty, blocked road enforcement.
6. **Phase 7 — Docker and Deployment Readiness:** Hardened Dockerfiles, non-root users, compose secrets, Vercel/Render documentation.
7. **Phase 8 — Automated Testing and CI:** Full pytest suite (unit, API, security, integration) + GitHub Actions CI workflow.
8. **Phase 9 — Observability and Operations:** Structured logging, correlation IDs, readiness probes, backup/restore guide.
9. **Phase 10 — Final Verification and Documentation:** `README.md`, `SECURITY.md`, `DEPLOYMENT.md`, `TEST_REPORT.md`, `MODEL_CARD.md`.
