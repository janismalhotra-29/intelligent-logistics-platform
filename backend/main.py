"""
Convenience entry point re-exporting the FastAPI ASGI application from backend.app.main.

This allows developers and operators to start the server using either:
  python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
  python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
"""
from backend.app.main import app

__all__ = ["app"]
