"""
Machine Learning & Explainable AI Validation Tests.
Tests risk model prediction, ETA regressor, CV heuristic classifier,
and input boundary clamping.
"""

import pytest
from ml.risk_model.train_and_predict import predict_road_risk, validate_risk_inputs
from ml.eta_model.train_and_predict import predict_eta, validate_eta_inputs
from ml.incident_classifier.classify import analyze_image_features, simulate_incident_classification
import io
from PIL import Image
import numpy as np


def test_risk_model_prediction_keys():
    features = {
        "rainfall_1h": 15.0,
        "rainfall_6h": 40.0,
        "rainfall_24h": 90.0,
        "rainfall_7d": 220.0,
        "forecast_rainfall": 60.0,
        "temperature": 21.0,
        "humidity": 88.0,
        "wind_speed": 14.0,
        "elevation": 1600.0,
        "slope": 30.0,
        "road_type_idx": 0,
        "road_surface_idx": 0,
        "road_condition_score": 3,
        "traffic_level_idx": 1,
        "river_proximity_m": 250.0,
        "historical_landslides": 3,
        "historical_floods": 0,
        "historical_incidents": 3,
        "bridge_condition_score": 4,
        "recent_field_reports_count": 0,
        "distance_to_hazard_m": 1200.0,
        "incident_count_30d": 1,
        "incident_count_90d": 3
    }
    res = predict_road_risk(features)
    assert "risk_score" in res
    assert 0 <= res["risk_score"] <= 100
    assert res["overall_level"] in ("NORMAL", "WATCH", "WARNING", "CRITICAL")
    assert "contributors" in res
    assert len(res["contributors"]) > 0
    assert res["is_synthetic_prototype"] is True


def test_risk_model_input_validation():
    # Negative values and non-finite floats should be safely sanitized
    dirty_features = {
        "rainfall_24h": -50.0,
        "slope": float("inf"),
        "elevation": float("nan")
    }
    validated = validate_risk_inputs(dirty_features)
    assert all(not np.isnan(v) and not np.isinf(v) for v in validated)


def test_eta_model_prediction_keys():
    features = {
        "distance_km": 120.0,
        "base_speed_kmh": 40.0,
        "road_condition_score": 3,
        "traffic_level_idx": 1,
        "rainfall_24h_mm": 60.0,
        "elevation_m": 1500.0,
        "slope_deg": 25.0,
        "route_risk_score": 45.0,
        "historical_avg_speed_kmh": 32.0,
        "time_of_day_hour": 14,
        "is_weekend": 0,
        "active_closures_count": 0,
        "vehicle_type_idx": 0
    }
    res = predict_eta(features)
    assert res["normal_duration_minutes"] == 180.0
    assert res["predicted_delay_minutes"] >= 0.0
    assert res["total_predicted_minutes"] >= res["normal_duration_minutes"]
    assert "estimated_variation_range" in res
    assert "uncertainty_metric" in res
    assert res["is_synthetic_prototype"] is True


def test_eta_model_input_clamping():
    # Negative distance or impossible speed should be clamped
    dirty_features = {
        "distance_km": -100.0,
        "base_speed_kmh": 0.0
    }
    validated = validate_eta_inputs(dirty_features)
    assert validated[0] >= 1.0  # distance_km
    assert validated[1] >= 10.0 # base_speed_kmh


def test_cv_classifier_empty_bytes():
    with pytest.raises(ValueError):
        analyze_image_features(b"")


def test_cv_classifier_corrupt_bytes():
    with pytest.raises(ValueError):
        analyze_image_features(b"this is totally not an image")


def test_cv_classifier_valid_image():
    buf = io.BytesIO()
    # Brownish color for landslide heuristic
    img = Image.new("RGB", (64, 64), color=(140, 85, 40))
    img.save(buf, format="JPEG")
    res = analyze_image_features(buf.getvalue())
    assert res["predicted_type"] in ("Landslide", "Flood", "Road Damage", "Bridge Damage", "Traffic Obstruction", "Normal")
    assert 0 <= res["confidence_percentage"] <= 100
    assert "heuristic_signals" in res
