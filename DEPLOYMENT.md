# DEPLOYMENT GUIDE: NER Smart Logistics and Accessibility Intelligence Platform

**Date:** October 19, 2026  
**Target Environment:** Cloud Production (Vercel Frontend + Render/Railway Backend + Managed PostGIS Database)  
**Security Standard:** Strict Secret Separation, Non-Root Containers, Verified TLS, Explicit CORS Whitelisting

---

## 1. Architecture & Hosting Topology

```
┌────────────────────────────────┐         HTTPS          ┌───────────────────────────────────┐
│        Vercel (Edge CDN)       │ ──────────────────────>│        Render / Cloud VM          │
│   React 18 + Vite + Tailwind   │                        │   FastAPI Web Service (Python 3.12)│
│  Domain: ner-logistics.app     │ <──────────────────────│   Port: 8000                      │
└────────────────────────────────┘         WSS (WS)       └───────────────────────────────────┘
                                                                            │
                                                                            │ TLS Connection
                                                                            ▼
                                                          ┌───────────────────────────────────┐
                                                          │   Managed PostgreSQL + PostGIS    │
                                                          │   (Supabase / Neon / Render DB)   │
                                                          │   Port: 5432 (Private / SSL)      │
                                                          └───────────────────────────────────┘
```

---

## 2. Step 1: Managed PostgreSQL + PostGIS Database Setup

### 2.1 Provider Recommendation
- **Supabase** or **Render Managed PostgreSQL** or **Neon**:
  - Requires `PostGIS` extension enabled (`CREATE EXTENSION IF NOT EXISTS postgis;`).
  - Recommended minimum plan: 1 GB RAM, 10 GB SSD.

### 2.2 Schema Migration
1. Connect using `psql` or database dashboard:
   ```bash
   psql "postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require" -f database/migrations/001_init_postgis.sql
   ```
2. Verify spatial indexes and tables:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   SELECT postgis_full_version();
   ```
3. Secure the database:
   - Ensure the database is accessible only with `sslmode=require`.
   - Never use the superuser account for application runtime; grant `SELECT, INSERT, UPDATE, DELETE` to a dedicated `ner_app_user`.

---

## 3. Step 2: Backend Web Service Deployment (Render / Railway)

### 3.1 Repository Connection
1. In Render, create a new **Web Service** pointing to the repository.
2. Select **Docker** or **Python 3.12** runtime.

### 3.2 Build & Start Commands (if using native Python)
- **Root Directory:** Repository root
- **Build Command:**
  ```bash
  pip install --no-cache-dir -r requirements.txt && python ml/risk_model/train_and_predict.py && python ml/eta_model/train_and_predict.py && python backend/app/seed_generator.py
  ```
- **Start Command:**
  ```bash
  uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
  ```

### 3.3 Required Backend Environment Variables

| Variable | Description | Example / Production Value |
| :--- | :--- | :--- |
| `ENVIRONMENT` | Runtime profile | `production` |
| `DEBUG` | Enable debug logs | `false` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/ner_logistics?sslmode=require` |
| `ADMIN_API_KEY` | Secret token for administrative ops | `GENERATE_A_SECURE_RANDOM_32_CHAR_HEX` |
| `SECRET_KEY` | Session and cryptographic token key | `GENERATE_A_SECURE_RANDOM_64_CHAR_HEX` |
| `FRONTEND_ORIGINS` | Explicit CORS origin whitelist | `https://your-frontend.vercel.app` |
| `PORT` | Web port bound by host | `8000` (or injected by Render) |

### 3.4 Verification
Once deployed, verify the public health endpoint:
```bash
curl -f https://your-backend.onrender.com/health
```
Expected output:
```json
{
  "status": "HEALTHY",
  "service": "NER Smart Logistics Intelligence Platform API",
  "environment": "production",
  "database": "PostgreSQL (Configured)",
  "database_status": "OPERATIONAL",
  "ml_engine": "LOADED",
  "coverage": "All 8 States (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura)",
  "active_scenario_step": 1
}
```

---

## 4. Step 3: Frontend Deployment (Vercel)

### 4.1 Configuration
1. In Vercel, click **Add New Project** and select the repository.
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Ensure Build Command is `npm run build` and Output Directory is `dist`.

### 4.2 Required Frontend Environment Variables

| Variable | Description | Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Deployed backend API URL | `https://your-backend.onrender.com/api` |
| `VITE_WS_URL` | Deployed live WebSocket stream URL | `wss://your-backend.onrender.com/ws/live` |

> [!IMPORTANT]
> Never place server secrets (`ADMIN_API_KEY`, `POSTGRES_PASSWORD`, etc.) in `VITE_*` variables. Any variable prefixed with `VITE_` is compiled into the client-side JavaScript bundle visible in browsers.

### 4.3 Single Page Application (SPA) Routing on Vercel
Create `frontend/vercel.json` if direct route navigation (e.g., `/road-intelligence`) requires rewrites:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 5. Step 4: Local Single-Node Docker Compose Deployment

To run the entire hardened stack locally or on a single Linux VPS:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set strong values for `POSTGRES_PASSWORD` and `ADMIN_API_KEY`.
3. Launch with Docker Compose:
   ```bash
   docker compose up -d --build
   ```
4. Verify running containers:
   ```bash
   docker compose ps
   ```
5. Access:
   - Frontend: `http://localhost:3000`
   - Backend API Docs: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/health`
6. Teardown:
   ```bash
   docker compose down
   ```
   *(To wipe database volumes: `docker compose down -v`)*

---

## 6. Post-Deployment Verification Checklist

- [ ] HTTPS is active with a valid SSL certificate on both frontend and backend.
- [ ] Database port 5432 is private and not exposed to the public internet.
- [ ] `/health` returns status `HEALTHY` and reports `database_status: OPERATIONAL`.
- [ ] Frontend map loads tiles without Mixed Content warnings.
- [ ] Photo upload with oversized or non-image files returns 413 or 415 error without crashing backend.
- [ ] Vehicle diversion and scenario reset require valid `ADMIN_API_KEY` or role authorization in production.
- [ ] Live weather telemetry connects via verified TLS from Open-Meteo.
