FROM python:3.12-slim

WORKDIR /app

# Install system libraries needed for numpy, scipy, and spatial algorithms
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

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

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
