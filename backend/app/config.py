"""
Application Configuration and Security Settings for NER Smart Logistics Platform.
Validates environment variables at startup and provides safe defaults.
"""

import os
from typing import List
from pydantic import BaseModel, Field


class Settings(BaseModel):
    # Environment mode
    ENVIRONMENT: str = Field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))
    DEBUG: bool = Field(default_factory=lambda: os.getenv("DEBUG", "false").lower() in ("true", "1", "yes"))
    
    # Server network bindings
    HOST: str = Field(default_factory=lambda: os.getenv("HOST", "0.0.0.0"))
    PORT: int = Field(default_factory=lambda: int(os.getenv("PORT", "8000")))
    
    # Database
    DATABASE_URL: str = Field(
        default_factory=lambda: os.getenv(
            "DATABASE_URL", 
            "sqlite:///./data/ner_platform.db"
        )
    )
    
    # Security & Authentication
    ADMIN_API_KEY: str = Field(
        default_factory=lambda: os.getenv("ADMIN_API_KEY", "ner-admin-dev-key-2026")
    )
    SECRET_KEY: str = Field(
        default_factory=lambda: os.getenv("SECRET_KEY", "ner-super-secret-jwt-encryption-key-2026")
    )
    
    # CORS Configuration
    FRONTEND_ORIGINS_RAW: str = Field(
        default_factory=lambda: os.getenv(
            "FRONTEND_ORIGINS", 
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
        )
    )
    
    # Upload limits
    MAX_UPLOAD_SIZE_BYTES: int = Field(default=5 * 1024 * 1024)  # 5 MB
    ALLOWED_IMAGE_MIMES: List[str] = ["image/jpeg", "image/png", "image/webp"]
    
    # Open-Meteo external telemetry
    WEATHER_API_TIMEOUT_SEC: float = 5.0
    WEATHER_CACHE_TTL_SEC: int = 300  # 5 minutes
    
    def get_allowed_origins(self) -> List[str]:
        """Parse comma-separated origins and strip whitespace."""
        origins = [orig.strip() for orig in self.FRONTEND_ORIGINS_RAW.split(",") if orig.strip()]
        if not origins:
            return ["http://localhost:3000", "http://127.0.0.1:3000"]
        return origins

    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    def get_safe_db_summary(self) -> str:
        """Return sanitized database connection info without leaking credentials."""
        if "sqlite" in self.DATABASE_URL:
            return "SQLite (Persistent Local)"
        if "@" in self.DATABASE_URL:
            parts = self.DATABASE_URL.split("@")
            backend_part = parts[0].split("://")[0]
            host_part = parts[1]
            return f"{backend_part}://***:***@{host_part}"
        return "PostgreSQL (Configured)"


# Global settings singleton
settings = Settings()
