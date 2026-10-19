"""
Database connection, session management, and schema initialization.
Supports PostgreSQL/PostGIS in production and persistent local storage with graceful fallback.
"""

import os
import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.app.config import settings

logger = logging.getLogger("ner_logistics.db")

Base = declarative_base()

def _get_engine():
    db_url = settings.DATABASE_URL
    connect_args = {}
    
    if db_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
        os.makedirs(os.path.dirname(os.path.abspath(db_url.replace("sqlite:///", ""))), exist_ok=True)
    
    try:
        engine = create_engine(
            db_url,
            connect_args=connect_args,
            pool_pre_ping=True
        )
        # Test connection
        with engine.connect() as conn:
            pass
        logger.info(f"Connected to database: {settings.get_safe_db_summary()}")
        return engine
    except Exception as e:
        logger.warning(f"Could not connect to configured DB ({settings.get_safe_db_summary()}): {e}. Falling back to local persistent SQLite.")
        fallback_path = "./data/ner_platform.db"
        os.makedirs("./data", exist_ok=True)
        fallback_url = f"sqlite:///{fallback_path}"
        engine = create_engine(fallback_url, connect_args={"check_same_thread": False}, pool_pre_ping=True)
        return engine

engine = _get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for database session with automatic commit/rollback."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
