# Security Policy & Architecture

**Project:** NER Smart Logistics and Accessibility Intelligence Platform  
**Date:** October 19, 2026  
**Status:** Hardened & Certified  

---

## 1. Security Architecture & Threat Model

The platform is designed with defense-in-depth principles across all layers:

```
[ Client Browser / Mobile ]
         │ HTTPS / WSS
         ▼
[ Reverse Proxy / Edge CDN (Vercel / Nginx) ]
  • TLS 1.3 Termination
  • Security Headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options)
  • Rate & Size Limiting (client_max_body_size 10M)
         │ Reverse Proxy Pass
         ▼
[ Application Layer (FastAPI) ]
  • Non-root process execution (UID 10001: appuser)
  • Correlation ID Tracking (X-Correlation-ID)
  • Explicit CORS Whitelisting (No wildcard credentials)
  • Role-Based Access Control (RBAC: ADMIN, OPERATOR, VIEWER)
  • Request Body Validation (Pydantic models with range/length checks)
  • Strict Image Upload Validation (5MB max, MIME & Magic Bytes inspection)
         │ TLS 1.3
         ▼
[ Data Layer (PostgreSQL + PostGIS / SQLite) ]
  • Private Network Isolation (Port 5432 bound internally)
  • Principle of Least Privilege (dedicated ner_app_user)
  • No Plaintext Credentials in VCS (.env git-ignored, .env.example placeholders)
  • Parameterized Queries & SQLAlchemy 2.0 ORM (SQL Injection immune)
```

---

## 2. Secrets & Credential Management

- **Zero Hardcoded Secrets:** All database credentials, secret keys, and admin API keys are strictly loaded via environment variables or Docker secrets.
- **Git-Ignored Environment:** Real `.env` files are excluded in `.gitignore`. Only `.env.example` with sanitized placeholders is committed.
- **Log Sanitization:** Sensitive connection strings (passwords, usernames) are automatically masked in logs and health check outputs (`postgresql://***:***@host:port/dbname`).
- **Frontend Isolation:** No server-side secrets are exposed to `VITE_*` variables. Only public endpoint URLs (`VITE_API_BASE_URL`, `VITE_WS_URL`) are bundled into client assets.

---

## 3. Network & Transport Layer Security

- **Strict CORS Configuration:** `allow_origins` strictly enforces explicit domain whitelists configured in `FRONTEND_ORIGINS`. Wildcard origins (`*`) combined with `allow_credentials=True` are prohibited.
- **Outbound HTTP / External Services:** Outbound HTTP requests (e.g. to Open-Meteo live weather services) strictly enforce TLS certificate verification. Unverified SSL contexts (`ssl._create_unverified_context()`) are disallowed.
- **Bounded Retries & Timeouts:** All external HTTP calls include mandatory socket timeouts (6.0 seconds) and exponential backoff to prevent denial of service from hanging sockets.

---

## 4. Role-Based Access Control (RBAC)

Mutating and sensitive operational endpoints require authorization via either:
1. `X-API-Key: <ADMIN_API_KEY>` header, or
2. `Authorization: Bearer <TOKEN>` header.

Protected endpoints include:
- `POST /api/scenario/reset` (Requires role: `ADMIN`)
- `POST /api/scenario/step` (Requires role: `ADMIN` or `OPERATOR`)
- `POST /api/vehicles/{vehicle_id}/divert` (Requires role: `ADMIN` or `OPERATOR`)

Read-only inspection endpoints (e.g. `/api/roads`, `/api/hubs`, `/health`) remain accessible for dashboard visualization.

---

## 5. Incident Photo Upload Security

The field incident photo upload endpoint (`POST /api/incidents/classify-photo`) is protected by multi-layered validation:
1. **Size Limits:** Maximum file size strictly enforced at 5 MB (5,242,880 bytes).
2. **MIME & Magic Bytes Inspection:** Only validated `image/jpeg`, `image/png`, and `image/webp` formats are accepted.
3. **Server-Side Filename Generation:** Uploaded files are assigned random UUID v4 filenames on disk, preventing directory traversal and filename collision attacks.
4. **Safe Error Handling:** Malformed or corrupt image payloads return structured HTTP 400 Bad Request responses without fabricating synthetic incidents or exposing tracebacks.

---

## 6. Reporting a Vulnerability

If you discover a security vulnerability within this project:
1. **Do not create a public GitHub issue.**
2. Email the project maintainers with details, reproduction steps, and potential impact.
3. Maintainers will acknowledge receipt within 48 hours and coordinate remediation.
