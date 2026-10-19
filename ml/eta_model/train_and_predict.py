"""
ML ETA and Transit Delay Prediction Model for North Eastern Region (NER).
PROTOTYPE NOTICE: Trained on synthetic trip and mountain delay distributions.
Designed for operational decision support, distinguishing predicted ETA from actual observed transit.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(MODEL_DIR, "eta_regressor_model.joblib")

FEATURE_NAMES = [
    "distance_km",
    "base_speed_kmh",
    "road_condition_score",  # 1 to 5
    "traffic_level_idx",     # 0 to 3
    "rainfall_24h_mm",
    "elevation_m",
    "slope_deg",
    "route_risk_score",      # 0 to 100
    "historical_avg_speed_kmh",
    "time_of_day_hour",      # 0 to 23
    "is_weekend",            # 0 or 1
    "active_closures_count",
    "vehicle_type_idx"       # 0: Light Supply Truck (4x4), 1: Heavy Transport, 2: Cold-Chain Van, 3: Emergency Escort
]


def generate_synthetic_eta_data(n_samples: int = 5000, random_seed: int = 42):
    """Generate realistic trip dataset reflecting mountain winding roads, monsoon delays, and checkposts."""
    np.random.seed(random_seed)
    
    distance_km = np.random.uniform(15, 380, n_samples)
    base_speed_kmh = np.random.uniform(25, 60, n_samples)  # Mountain average speeds: 30-45 km/h
    road_condition = np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.12, 0.22, 0.36, 0.20, 0.10])
    traffic_idx = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.40, 0.35, 0.18, 0.07])
    rainfall_24h = np.random.exponential(scale=50, size=n_samples)
    elevation_m = np.random.uniform(100, 3400, n_samples)
    slope_deg = np.random.uniform(2, 45, n_samples)
    route_risk = np.clip((rainfall_24h * 0.35) + (slope_deg * 0.8) + np.random.normal(0, 10, n_samples), 5, 99)
    historical_avg_speed = np.clip(base_speed_kmh - (slope_deg * 0.25) - (rainfall_24h * 0.04), 15, 55)
    time_of_day = np.random.randint(0, 24, n_samples)
    is_weekend = np.random.choice([0, 1], size=n_samples, p=[0.72, 0.28])
    active_closures = np.where(route_risk > 75, np.random.poisson(lam=1.2, size=n_samples), 0)
    vehicle_type = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.40, 0.35, 0.15, 0.10])
    
    # Ideal transit time in minutes
    ideal_time_min = (distance_km / base_speed_kmh) * 60.0
    
    # Realistic delay components
    rain_delay = (rainfall_24h / 40.0) * (distance_km * 0.15)
    risk_delay = (route_risk / 100.0) * (distance_km * 0.28)
    elevation_delay = np.maximum(0, (elevation_m - 1200) / 1000.0) * 20.0
    road_cond_delay = ((5 - road_condition) / 4.0) * 35.0
    closure_delay = active_closures * np.random.uniform(45, 120, n_samples)
    traffic_delay = traffic_idx * 15.0
    
    total_delay_min = rain_delay + risk_delay + elevation_delay + road_cond_delay + closure_delay + traffic_delay
    total_delay_min = np.maximum(0, total_delay_min + np.random.normal(0, 8, n_samples))
    
    df = pd.DataFrame({
        "distance_km": distance_km,
        "base_speed_kmh": base_speed_kmh,
        "road_condition_score": road_condition,
        "traffic_level_idx": traffic_idx,
        "rainfall_24h_mm": rainfall_24h,
        "elevation_m": elevation_m,
        "slope_deg": slope_deg,
        "route_risk_score": route_risk,
        "historical_avg_speed_kmh": historical_avg_speed,
        "time_of_day_hour": time_of_day,
        "is_weekend": is_weekend,
        "active_closures_count": active_closures,
        "vehicle_type_idx": vehicle_type,
        "ideal_time_min": ideal_time_min,
        "target_delay_min": total_delay_min
    })
    return df


def train_eta_model():
    """Train and evaluate the delay regressor model against a simple baseline."""
    print("Generating synthetic trip and delay dataset...")
    df = generate_synthetic_eta_data(n_samples=5000, random_seed=42)
    
    X = df[FEATURE_NAMES]
    y = df["target_delay_min"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 1. Simple Baseline: Fixed historical mean delay
    baseline_pred = np.full_like(y_test, fill_value=y_train.mean())
    baseline_mae = mean_absolute_error(y_test, baseline_pred)
    baseline_r2 = r2_score(y_test, baseline_pred)
    
    # 2. Random Forest Regressor
    print("Training Random Forest ETA Regressor...")
    model = RandomForestRegressor(
        n_estimators=140,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    
    print(f"--- ETA Model Evaluation (Synthetic Test Set, N={len(y_test)}) ---")
    print(f"Baseline (Mean Delay) MAE: {baseline_mae:.2f} mins, R2: {baseline_r2:.4f}")
    print(f"RandomForest Model MAE:    {mae:.2f} mins")
    print(f"RandomForest Model RMSE:   {rmse:.2f} mins (Used as empirical uncertainty range)")
    print(f"RandomForest Model R2:     {r2:.4f}")
    
    payload = {
        "model": model,
        "feature_names": FEATURE_NAMES,
        "dataset_type": "Synthetic Mountain Trip Simulation (Prototype)",
        "model_version": "2.0.0-prototype",
        "metrics": {
            "baseline_mae": float(baseline_mae),
            "mae": float(mae),
            "rmse": float(rmse),
            "r2": float(r2)
        }
    }
    joblib.dump(payload, MODEL_FILE)
    print(f"Saved ETA model payload to {MODEL_FILE}")
    return payload


_LOADED_ETA_MODEL = None


def get_eta_model():
    """Load or lazily initialize the trained ETA model."""
    global _LOADED_ETA_MODEL
    if _LOADED_ETA_MODEL is None:
        if not os.path.exists(MODEL_FILE):
            _LOADED_ETA_MODEL = train_eta_model()
        else:
            _LOADED_ETA_MODEL = joblib.load(MODEL_FILE)
    return _LOADED_ETA_MODEL


def format_duration(minutes: float) -> str:
    """Format minutes into human readable 'Xh Ym'."""
    mins = max(0, int(round(minutes)))
    hours = mins // 60
    rem_mins = mins % 60
    if hours > 0:
        return f"{hours}h {rem_mins:02d}m"
    return f"{rem_mins}m"


def validate_eta_inputs(features: dict) -> list:
    """Validate numeric ranges and clamp invalid or non-finite inputs."""
    row = []
    for k in FEATURE_NAMES:
        val = features.get(k, 0.0)
        try:
            val_f = float(val)
            if not np.isfinite(val_f):
                val_f = 0.0
        except (ValueError, TypeError):
            val_f = 0.0
        
        if k == "distance_km":
            val_f = max(1.0, min(2000.0, val_f))
        elif k == "base_speed_kmh":
            val_f = max(10.0, min(120.0, val_f))
        elif k == "rainfall_24h_mm":
            val_f = max(0.0, min(1000.0, val_f))
        elif k == "route_risk_score":
            val_f = max(0.0, min(100.0, val_f))
        row.append(val_f)
    return row


def predict_eta(features: dict) -> dict:
    """
    Predict Normal ETA, Expected Delay, and Predicted Total ETA with an empirical uncertainty range.
    """
    payload = get_eta_model()
    model = payload["model"]
    test_rmse = payload.get("metrics", {}).get("rmse", 15.0)
    
    distance_km = float(features.get("distance_km", 60.0))
    base_speed = float(features.get("base_speed_kmh", 40.0))
    if base_speed <= 5:
        base_speed = 35.0
        
    normal_minutes = (distance_km / base_speed) * 60.0
    
    row = validate_eta_inputs(features)
    X_sample = pd.DataFrame([row], columns=FEATURE_NAMES)
    
    predicted_delay_min = float(model.predict(X_sample)[0])
    predicted_delay_min = max(0.0, predicted_delay_min)
    
    total_minutes = normal_minutes + predicted_delay_min
    
    # Empirical variation range using +/- 1 test RMSE
    low_minutes = max(normal_minutes, total_minutes - test_rmse)
    high_minutes = total_minutes + test_rmse
    
    return {
        "normal_duration_minutes": round(normal_minutes, 1),
        "predicted_delay_minutes": round(predicted_delay_min, 1),
        "total_predicted_minutes": round(total_minutes, 1),
        "normal_eta": format_duration(normal_minutes),
        "expected_delay": f"+{format_duration(predicted_delay_min)}" if predicted_delay_min > 0 else "0m",
        "predicted_eta": format_duration(total_minutes),
        "estimated_variation_range": f"{format_duration(low_minutes)} – {format_duration(high_minutes)}",
        "uncertainty_metric": f"±{round(test_rmse, 1)} min (Test Set Empirical RMSE)",
        "model_version": "2.0.0-prototype",
        "is_synthetic_prototype": True,
        "calibration_notice": "Estimated delay range derived from test set residual RMSE. Not a calibrated Bayesian credible interval."
    }


if __name__ == "__main__":
    train_eta_model()
