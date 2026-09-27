# RailPulse AI • Train Ticket Price Prediction Web Application

A premium, modern, and highly interactive user interface designed for machine learning-based train ticket price prediction. Built with a travel-tech aesthetic inspired by **Trainline** and **Expedia**, featuring an elevated booking studio, authentic digital ticket stub visualization, and bi-directional parameter synchronization.

---

## 🌟 Key Features

1. **Travel-Tech Design System**:
   - Palette: Clean off-white background (`#f4f7f6`), deep transit navy (`#1e3a8a`), vibrant energetic coral (`#ff6b57`), and calming travel teal (`#0d9488`).
   - Geometric typography via **Google Fonts (Poppins & Montserrat)**.
   - Ambient radial transit glow and layered elevation shadows.

2. **Live Model Status Badge**:
   - Floating pill badge with real-time pulsating indicator: `🧠 Active Model: Random Forest | Accuracy: 94.2%`.

3. **Smart Booking Studio**:
   - **Station Selection & Quick Swap**: Interactive origin/destination with 180° rotation swap animation.
   - **Popular Route Chips**: 1-click presets (Delhi ⇄ Mumbai, Bengaluru ⇄ Chennai, Kolkata ⇄ Delhi, Mumbai ⇄ Goa).
   - **Bi-Directional Calendar & Days Ahead Sync**: Modifying departure date auto-calculates days ahead, and adjusting days ahead auto-updates the travel calendar.
   - **Class & Quota Multipliers**: AC 3-Tier, 2-Tier, 1A, Sleeper, Chair Car, and Tatkal/Premium Tatkal quotas.

4. **Authentic Digital Train Ticket Stub**:
   - Boarding pass styling with perforated dashed separation and semi-circular side notches.
   - Large bold price hero display (`₹ 1,543` / `$ 18.37`) with smooth count-up ticker animation.
   - PNR and train number generation, route line graphic with moving train icon, and simulated high-tech barcode.
   - Cost breakdown drawer: Base Rail Distance Fare, Class Surcharge, Dynamic Surge Factor, and GST.
   - Instant currency toggle between Indian Rupees (`₹ INR`) and US Dollars (`$ USD`).

---

## 📋 HTML Element IDs & Data Specifications

All form controls have standardized `id` and `name` attributes for straightforward integration with your Python or JavaScript backend:

| HTML Element | ID Attribute | Type | Example Values | Backend Feature Type |
|---|---|---|---|---|
| `<form>` | `fare-prediction-form` | Form Element | N/A | Form wrapper |
| `<select>` | `origin-station` | Dropdown | `"NDLS"`, `"MMCT"`, `"SBC"`, `"MAS"` | Categorical / String |
| `<button>` | `swap-stations-btn` | Button | N/A | Interactive Swap |
| `<select>` | `destination-station` | Dropdown | `"MMCT"`, `"NDLS"`, `"HWH"`, `"MAO"` | Categorical / String |
| `<select>` | `travel-class` | Dropdown | `"3A"`, `"2A"`, `"1A"`, `"SL"`, `"EC"`, `"2S"` | Categorical / Multiplier |
| `<select>` | `train-type` | Dropdown | `"Superfast"`, `"Rajdhani"`, `"Express"`, `"Passenger"` | Categorical / Multiplier |
| `<input>` | `departure-date` | Date | `"2026-10-12"` | Date string (YYYY-MM-DD) |
| `<input>` | `days-until-departure`| Number | `14`, `3`, `30`, `60` | Numerical (Integer) |
| `<select>` | `booking-quota` | Dropdown | `"GN"`, `"TQ"`, `"PT"`, `"LD"` | Categorical / String |
| `<button>` | `predict-btn` | Submit Button | N/A | Triggers prediction |
| `<section>`| `ticket-result` | Container | N/A | Revealed on prediction |
| `<span>` | `ticket-price` | Text Span | `1,543` | Output Fare Display |

---

## 🚀 Running the Frontend Locally

You can run this application locally with Python:

```bash
# Navigate to the project directory
cd "e:\Coding\Project\train ticket price prediction"

# Start the local server
python -m http.server 8000
```

Now open `http://localhost:8000` in your web browser.

---

## 🐍 Python ML Backend Integration Guide

Connect your trained Machine Learning train fare prediction model to the web interface using Flask or FastAPI:

### Sample Flask Backend (`app.py`)

```python
from flask import Flask, request, jsonify, render_template
import pickle
import numpy as np

app = Flask(__name__, static_folder='.', template_folder='.')

# Load your trained model (e.g., train_fare_model.pkl)
# model = pickle.load(open('model/train_fare_model.pkl', 'rb'))

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        origin = data.get('origin_station')
        dest = data.get('destination_station')
        travel_class = data.get('travel_class')
        train_type = data.get('train_type')
        days_ahead = int(data.get('days_until_departure', 14))
        quota = data.get('booking_quota', 'GN')
        
        # --- Preprocessing & Feature Extraction ---
        # 1. Map origin & destination to distance (or one-hot encode)
        # 2. Map travel_class (SL=1, 3A=2.7, 2A=3.8, 1A=6.2)
        # 3. Feed to your model: model.predict([[features...]])
        
        # Example prediction result
        predicted_fare = 1540.0
        
        return jsonify({
            'status': 'success',
            'fare': round(predicted_fare),
            'breakdown': {
                'base': 1120,
                'classSurge': 350,
                'dynamicSurge': 0,
                'tax': 70
            },
            'distance': 1384,
            'surge_label': '⚡ Normal Demand Window',
            'message': 'Prediction generated by Random Forest Regressor v2.4'
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```
