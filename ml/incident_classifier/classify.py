"""
Baseline Computer Vision Heuristic Classifier for Field Officer Incident Photos.
Extracts color distributions, texture, and Sobel gradient edge intensity to categorize
road photos into:
- Landslide
- Flood
- Road Damage
- Bridge Damage
- Traffic Obstruction
- Normal

NOTE: This is a transparent deterministic heuristic baseline prototype, NOT a deep learning model.
Confidence scores reflect normalized softmax heuristic class scores and are explicitly labelled.
"""

import io
import os
import numpy as np
from PIL import Image

CLASSES = [
    "Landslide",
    "Flood",
    "Road Damage",
    "Bridge Damage",
    "Traffic Obstruction",
    "Normal"
]

RECOMMENDED_ACTIONS = {
    "Landslide": "Immediately close road segment, deploy JCB clearance team, and reroute traffic via secondary corridor.",
    "Flood": "Halt low-clearance vehicles, monitor river gauge telemetry, and issue flash flood warning.",
    "Road Damage": "Restrict heavy convoy tonnage to single lane, install warning beacons, and schedule emergency asphalt patchwork.",
    "Bridge Damage": "Complete structural cordon, divert all heavy transport, and summon BRO/PWD engineering inspection.",
    "Traffic Obstruction": "Dispatch traffic marshals, clear stranded multi-axle vehicle, and inform downstream checkposts.",
    "Normal": "Road passage clear. Continue routine patrol monitoring."
}


def analyze_image_features(image_bytes: bytes) -> dict:
    """
    Extract color, texture, and edge signatures from raw photo bytes
    to classify incident type using documented heuristics.
    Fails safely without inventing false landslide hazard classifications.
    """
    if not image_bytes or len(image_bytes) == 0:
        raise ValueError("Empty image payload provided for classification")

    try:
        img = Image.open(io.BytesIO(image_bytes))
        # Validate format is supported
        if img.format not in ("JPEG", "PNG", "WEBP"):
            raise ValueError(f"Unsupported image format: {img.format}. Expected JPEG, PNG, or WEBP.")
            
        img = img.convert("RGB")
        img = img.resize((128, 128))
        arr = np.array(img, dtype=np.float32)
    except Exception as e:
        # Re-raise so caller returns proper 400 Bad Request instead of hiding errors
        raise ValueError(f"Invalid or corrupt image file: {str(e)}")
    
    # Color distribution analysis
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    
    # Mud / earth tones (high red and green with lower blue: brownish/muddy for landslides)
    brownish_ratio = float(np.mean((r > 90) & (g > 60) & (b < 70) & (r > b * 1.3)))
    
    # Water / flood tones (high blue/grey, low variance)
    water_ratio = float(np.mean((b > 110) & (np.abs(r - g) < 25)))
    
    # Grayscale / asphalt variance (cracks/potholes)
    gray = 0.2989 * r + 0.5870 * g + 0.1140 * b
    grad_y, grad_x = np.gradient(gray)
    edge_intensity = float(np.mean(np.sqrt(grad_x**2 + grad_y**2)))
    
    # Deterministic scoring heuristics
    scores = {
        "Landslide": float(brownish_ratio * 3.5 + (edge_intensity / 40.0) * 0.4),
        "Flood": float(water_ratio * 3.2 + (1.0 - edge_intensity / 60.0) * 0.3),
        "Road Damage": float((edge_intensity / 30.0) * 0.7 + (1.0 - brownish_ratio) * 0.3),
        "Bridge Damage": float((edge_intensity / 35.0) * 0.5 + 0.2),
        "Traffic Obstruction": float(0.25 + float(np.std(arr)) / 255.0),
        "Normal": float(0.30 if edge_intensity < 18 else 0.10)
    }
    
    # Softmax normalization across heuristic scores
    exp_vals = np.exp(np.array(list(scores.values())) * 2.0)
    probs = exp_vals / np.sum(exp_vals)
    class_probs = dict(zip(scores.keys(), probs))
    
    predicted_class = max(class_probs, key=class_probs.get)
    raw_confidence = int(round(class_probs[predicted_class] * 100))
    # Unboosted, honest confidence from heuristic probability
    confidence = max(1, min(100, raw_confidence))
        
    severity = "HIGH" if predicted_class in ["Landslide", "Bridge Damage"] else ("MEDIUM" if predicted_class in ["Flood", "Road Damage"] else "LOW")
    
    return {
        "incident_detected": predicted_class != "Normal",
        "predicted_type": predicted_class,
        "confidence_percentage": confidence,
        "severity": severity,
        "recommended_action": RECOMMENDED_ACTIONS.get(predicted_class, RECOMMENDED_ACTIONS["Normal"]),
        "model_architecture": "Heuristic Color/Edge Baseline Prototype",
        "is_simulation": False,
        "heuristic_signals": {
            "brownish_terrain_ratio": round(brownish_ratio, 3),
            "water_surface_ratio": round(water_ratio, 3),
            "edge_gradient_intensity": round(edge_intensity, 2)
        }
    }


def simulate_incident_classification(override_type: str = None) -> dict:
    """Simulation mode classification for demo and drill purposes only."""
    incident_type = override_type if override_type in CLASSES else "Landslide"
    severity = "HIGH" if incident_type in ["Landslide", "Bridge Damage"] else "MEDIUM"
    return {
        "incident_detected": incident_type != "Normal",
        "predicted_type": incident_type,
        "confidence_percentage": 90,
        "severity": severity,
        "recommended_action": RECOMMENDED_ACTIONS.get(incident_type, RECOMMENDED_ACTIONS["Normal"]),
        "model_architecture": "Demo Scenario Simulation",
        "is_simulation": True
    }
