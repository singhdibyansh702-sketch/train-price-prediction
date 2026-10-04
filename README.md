# RailPulse AI • Intelligent Train Transit Suite
### College Mini Project: Train Ticket Price, Delay & Seat Availability Prediction

An end-to-end Machine Learning web application designed for railway transit intelligence. Built specifically as an explainable, college-level mini project using **Python (Flask)**, **scikit-learn (Random Forest Algorithms)**, and a modern, responsive **Frontend (HTML5 / Vanilla CSS / JavaScript)**.

---

## 🏗️ Project Architecture & Structure

```text
Train Ticket Price Prediction
        │
        ├── 🎫 Ticket Price Prediction Module (Random Forest Regressor)
        │
        ├── ⏱️ Train Delay Prediction Module (Classifier + Regressor)
        │
        ├── 💺 Seat Availability Prediction Module (Occupancy Regressor)
        │
        ├── 📋 Main Dashboard (3 Interactive Cards & Navigation Tabs)
        │
        ├── 📜 Recent Predictions / Session History
        │
        └── 📈 Interactive ML Trend Visualizations
```

### Complete File Directory
```text
train-price-prediction/
├── app.py                     # Main Flask web application & REST API endpoints
├── train_models.py            # Dataset generator & ML model training script
├── index.html                 # Unified single-page application dashboard
├── styles.css                 # Clean, modern, responsive travel-tech styling
├── app.js                     # Dynamic frontend controller & client ML heuristics
├── requirements.txt           # Python dependencies (Flask, scikit-learn, pandas, joblib)
├── README.md                  # Complete documentation and viva guide
│
├── data/                      # Generated CSV datasets for training & viva review
│   ├── train_fare_dataset.csv
│   ├── train_delay_dataset.csv
│   └── seat_availability_dataset.csv
│
└── models/                    # Serialized scikit-learn model bundles (.pkl)
    ├── fare_model.pkl
    ├── delay_model.pkl
    └── seat_model.pkl
```

---

## 🌟 The Three Core ML Modules

### 1. 🎫 Train Ticket Price Prediction
- **Inputs**: Origin Station, Destination Station, Travel Class (1A, 2A, 3A, SL, EC, CC), Train Type (Rajdhani, Duronto, Superfast, Express), Departure Date, Days Until Departure, Booking Quota (GN, TQ, PT, LD).
- **Model**: `RandomForestRegressor`
- **Outputs**:
  - Predicted Total Fare (with live count-up animation and INR `₹` / USD `$` currency toggle).
  - Authentic Digital Train Ticket Stub visualization with route line and barcode.
  - Transparent Fare Breakdown: Base Railway Fare, Class & Train Surcharge, Dynamic Surge Factor, and GST (5% on AC).
  - Confidence Range (±4%).

### 2. ⏱️ Train Delay Prediction
- **Inputs**: Train Number & Name (presets or custom), Source Station, Destination Station, Journey Date, Departure Time, Route Distance (km), Day of Week.
- **Model**: Two-Stage Architecture
  - **Stage 1**: `RandomForestClassifier` predicts **On Time** vs. **Delayed** status.
  - **Stage 2**: `RandomForestRegressor` predicts **Estimated Delay in Minutes** (when delayed).
- **Outputs**:
  - `Delay Prediction: Delayed` (Red) or `Delay Prediction: On Time` (Green).
  - `Estimated Delay: 25 minutes` (or `0 minutes`).
  - `Prediction Confidence: 82%` with visual meter bar.
  - Transit factor explanations (Peak rush hour congestion, route distance, corridor clearance).

### 3. 💺 Train Seat Availability Prediction
- **Inputs**: Train Number/Name, Source Station, Destination Station, Journey Date, Class (Sleeper, 3A, 2A, 1A), Day of Week.
- **Model**: `RandomForestRegressor` modeling non-linear booking curve decay.
- **Outputs**:
  - `Available Seats: 42` (out of coach berth capacity).
  - Color-coded Categorized Status:
    - 🟢 **GREEN = Available** (> 30 seats remaining)
    - 🟡 **YELLOW = Filling Fast** (10 to 30 seats remaining)
    - 🔴 **RED = Almost Full** (< 10 seats remaining)
  - Visual Coach Berth Occupancy Gauge with percentage free.
  - `Prediction Confidence: 88%`.
  - Actionable confirmation advice and waitlist risk warning.

---

## ⚙️ Small Useful Additions Included

1. **Main Dashboard**: 3 prominent cards ("Predict Price", "Predict Delay", "Check Availability") that open the respective module with smooth scrolling.
2. **Module Navigation Tabs**: Clean 1-click switcher between Ticket Price, Train Delay, Seat Availability, Session History, and ML Trend Charts.
3. **Session History**: Logs every prediction made in the current session into browser storage with an empty state toggle and "Clear History" button.
4. **Interactive ML Trend Charts**: Native Canvas charts illustrating:
   - Dynamic Fare Surge vs. Days Ahead.
   - Delay Probability by Departure Hour (24h).
   - Seat Inventory Depletion Curve.
5. **Input Validation**: Prevents identical origin/destination stations, validates dates, and ensures positive values.
6. **Loading State**: Spinners and descriptive progress messages during computation.
7. **Form Reset Buttons**: 1-click reset button on each form restoring default values.

---

## 🚀 How to Run the Project Locally

### 1. Install Dependencies
Make sure you have Python 3.10+ installed. In your terminal, run:
```bash
pip install -r requirements.txt
```

### 2. (Optional) Re-train the Machine Learning Models
To generate fresh CSV datasets and re-train the scikit-learn models:
```bash
python train_models.py
```
This produces `data/*.csv` and saves the trained `.pkl` models into `models/`.

### 3. Start the Flask Application
```bash
python app.py
```
Open your browser and navigate to:
```text
http://127.0.0.1:5000/
```

---

## 📡 REST API Endpoints Specification

| Method | Endpoint | Description | Request Payload | Response Sample |
|---|---|---|---|---|
| `GET` | `/` | Web application UI | None | Serves `index.html` |
| `GET` | `/api/config` | Metadata for stations, trains, classes | None | JSON metadata |
| `POST` | `/predict` | Ticket Fare Prediction | `{"origin_station":"NDLS", "destination_station":"MMCT", "travel_class":"3A", ...}` | `{"fare": 2063, "status":"success", "breakdown":{...}}` |
| `POST` | `/predict/delay` | Train Delay Prediction | `{"train_number":"12952", "source_station":"NDLS", "destination_station":"MMCT", "departure_time":"16:55", ...}` | `{"prediction":"Delayed", "estimated_delay": 25, "confidence": 82, ...}` |
| `POST` | `/predict/seats` | Seat Availability Prediction | `{"train_number":"12952", "source_station":"NDLS", "destination_station":"MMCT", "travel_class":"3A", ...}` | `{"available_seats": 42, "availability_status":"Available", "badge_color":"green", ...}` |

---

## 🎓 College Viva Questions & Answers (Quick Cheat Sheet)

**Q1: Why did you choose Random Forest instead of Deep Learning?**  
*Answer:* This is a tabular regression and classification problem with structured tabular features (distance, travel class, departure time, days ahead). Random Forests handle non-linear interactions, require no feature scaling, resist overfitting through ensemble bagging, and are computationally efficient without requiring expensive GPU infrastructure.

**Q2: How does the Delay Prediction model work?**  
*Answer:* It uses a two-stage approach:
1. `RandomForestClassifier` determines whether delay probability is $\ge 50\%$ based on route distance, departure hour (identifying peak morning/evening rush hours), day of week, and train priority (e.g. Rajdhani vs. Passenger).
2. If delayed, a `RandomForestRegressor` estimates the expected delay in minutes.

**Q3: How are seat availability categories defined?**  
*Answer:* The `RandomForestRegressor` estimates remaining berths based on the booking horizon (days until departure) and coach capacity. The numerical seat count is mapped into 3 standardized categories:
- **Available (> 30 seats)**: High chance of confirmed booking (Green).
- **Filling Fast (10 - 30 seats)**: Moderate demand (Yellow).
- **Almost Full (< 10 seats)**: Critical capacity with high risk of RAC/Waitlist (Red).

**Q4: Does the project work standalone if the Python server is offline?**  
*Answer:* Yes. `app.js` contains client-side mathematical fallback heuristics that mirror the trained models, ensuring the web interface remains fully interactive even during offline demonstrations.
