FROM python:3.12-slim

WORKDIR /app

# Install system libraries needed for numpy, scipy, and spatial algorithms
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root dedicated application user
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/bash -m appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ml/ ml/
COPY data/ data/
COPY database/ database/
COPY backend/ backend/

# Pre-train / serialize ML models on container build
RUN python3 ml/risk_model/train_and_predict.py && \
    python3 ml/eta_model/train_and_predict.py && \
    python3 backend/app/seed_generator.py

# Ensure correct file permissions for non-root runtime
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
