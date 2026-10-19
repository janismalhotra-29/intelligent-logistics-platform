# MODEL CARD: NER Smart Logistics and Accessibility Intelligence Platform

**Model Release Version:** 2.0.0-prototype  
**Date:** October 19, 2026  
**Auditors & Authors:** Senior ML & AI Safety Engineers  
**Target Domain:** Decision-support routing and accessibility monitoring across the North Eastern Region of India (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura)

---

## 1. Ethical & Operational Disclaimer

> [!WARNING]
> **PROTOTYPE DECISION-SUPPORT SYSTEM ONLY:**
> The models in this repository are designed strictly as an **advisory decision-support prototype** for regional disaster logistics exercises. 
> - These models were trained on **synthetic topographical and meteorological data distributions** engineered to mirror Himalayan slope steepness and monsoon cloudbursts.
> - They **must NOT** be used as the sole or authoritative basis for emergency evacuation, critical medical convoy dispatch, or life-safety decisions without ground-truth physical verification from relevant authorities (e.g., Border Roads Organisation (BRO), State Disaster Management Authorities (SDMAs), or local Public Works Departments (PWD)).

---

## 2. Model 1: Mountain Road Disruption & Risk Classifier

### 2.1 Model Details
- **Architecture:** Random Forest Classifier (`n_estimators=150`, `max_depth=12`, `min_samples_split=4`)
- **Framework:** scikit-learn 1.5+
- **Input Features (23 numeric features):**
  1. `rainfall_1h`, `rainfall_6h`, `rainfall_24h`, `rainfall_7d`, `forecast_rainfall` (mm)
  2. `temperature` (°C), `humidity` (%), `wind_speed` (km/h)
  3. `elevation` (m), `slope` (degrees)
  4. `road_type_idx` (0: NH, 1: SH, 2: Border, 3: Rural)
  5. `road_surface_idx` (0: Asphalt, 1: Bituminous Concrete, 2: Gravel/Unpaved)
  6. `road_condition_score` (1: Critical to 5: Excellent)
  7. `traffic_level_idx` (0: Low to 3: Heavy)
  8. `river_proximity_m` (distance to river bank in meters)
  9. `historical_landslides`, `historical_floods`, `historical_incidents` (counts)
  10. `bridge_condition_score` (1 to 5)
  11. `recent_field_reports_count` (past 48h verified officer reports)
  12. `distance_to_hazard_m` (meters)
  13. `incident_count_30d`, `incident_count_90d`
- **Output:** Disruption probability (0–100%), overall risk level (`NORMAL`, `WATCH`, `WARNING`, `CRITICAL`), sub-risks (landslide, flood, rain, traffic), and projected disruption window.

### 2.2 Dataset Provenance & Synthesis
- **Provenance:** 100% Synthetic Data generated via `generate_synthetic_ner_data(n_samples=5000, random_seed=42)`.
- **Target Construction:** Latent physical hazard simulation combining slope vulnerability, 24h/7d rainfall saturation, low elevation river basin flood indices, and infrastructure degradation penalties.
- **Data Splitting:** 80% Train (4,000 samples), 20% Held-Out Test (1,000 samples), stratified by class label.

### 2.3 Evaluation Metrics vs Baseline

| Metric | Baseline (Most Frequent) | Random Forest Model (Held-Out Test Set) |
| :--- | :--- | :--- |
| **Accuracy** | 81.70% | **92.40%** |
| **Precision** | 0.00% | **85.91%** |
| **Recall (Hazard Detection)** | 0.00% | **69.95%** |
| **F1-Score** | 0.00% | **77.11%** |
| **ROC-AUC** | 0.5000 | **0.9619** |

**Confusion Matrix (N = 1,000):**
- True Negatives (TN): 796
- False Positives (FP): 21
- False Negatives (FN): 55 *(Critical safety metric: missed potential hazards)*
- True Positives (TP): 128

### 2.4 Explainable AI (XAI)
The model provides point-based attribution breakdowns:
- `+27`: Heavy 24h precipitation saturation (>100mm)
- `+20`: Historical landslide recurrence corridor
- `+14`: Steep mountain slope instability (>25°)
- `+12`: Active field officer observation report
- `+11`: Degraded road surface / poor drainage condition

---

## 3. Model 2: Mountain Transit Delay Regressor (ETA)

### 3.1 Model Details
- **Architecture:** Random Forest Regressor (`n_estimators=140`, `max_depth=12`, `min_samples_split=4`)
- **Inputs:** 13 features capturing distance (km), base mountain speed, road condition, traffic, rainfall, elevation, slope, route risk score, active roadblock count, time of day, and vehicle type.
- **Output:** Predicted delay in minutes, normal travel duration, total predicted travel time, and empirical variation range.

### 3.2 Evaluation Metrics vs Baseline

| Metric | Simple Baseline (Mean Delay) | Random Forest Model (Held-Out Test Set) |
| :--- | :--- | :--- |
| **MAE** | 55.28 minutes | **12.60 minutes** (4.4x improvement) |
| **RMSE** | 68.32 minutes | **20.41 minutes** |
| **R² Score** | -0.0000 | **0.9443** |

### 3.3 Uncertainty Interpretation
- The model outputs an **estimated variation range** bounded by `± 1 empirical RMSE` (±20.4 minutes on test data).
- This is an empirical residual metric from synthetic held-out validation; it is explicitly documented as **not a statistically calibrated Bayesian credible interval**.

---

## 4. Model 3: Incident Photo Classifier (Field Officer Uplink)

### 4.1 Methodology & Limitations
- **Architecture:** Deterministic computer vision heuristic baseline using normalized RGB color distributions and Sobel gradient spatial edge variance.
- **Classes:** `Landslide`, `Flood`, `Road Damage`, `Bridge Damage`, `Traffic Obstruction`, `Normal`.
- **Heuristics:**
  - Brownish mud/earth ratio ($R > 90, G > 60, B < 70, R > 1.3B$)
  - Water surface reflectance ratio ($B > 110, |R - G| < 25$)
  - High-frequency edge gradient density (structural road cracks, bridge collapses)
- **Honesty Disclosure:** This is **NOT** a deep convolutional neural network or vision transformer. It is an algorithmic baseline prototype.
- **Failure Behavior:** If an uploaded image is invalid, empty, or corrupt, the system returns an HTTP 400 Bad Request error. It **never fabricates a false Landslide detection**.

---

## 5. Summary of Known Limitations

1. **Synthetic Training Distribution:** Real-world geotechnical factors (soil shear strength, subsurface hydrology, rock cleavage planes) are not captured in the synthetic formulas.
2. **Missing Ground-Truth Image Dataset:** A verified, open-source dataset of North Eastern Himalayan road landslide photos is currently unavailable.
3. **Weather Dependency:** Predictions depend on Open-Meteo observational telemetry; local valley microclimates may deviate from regional station sensors.
