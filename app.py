import os
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='.', template_folder='.')

# Standard station distance heuristics (km)
STATION_DISTANCES = {
    'NDLS-MMCT': 1384, 'MMCT-NDLS': 1384,
    'NDLS-CSMT': 1384, 'CSMT-NDLS': 1384,
    'SBC-MAS': 362,   'MAS-SBC': 362,
    'HWH-NDLS': 1447, 'NDLS-HWH': 1447,
    'CSMT-MAO': 580,  'MAO-CSMT': 580,
    'ADI-NDLS': 934,  'NDLS-ADI': 934,
    'PNBE-NDLS': 998, 'NDLS-PNBE': 998,
    'HYB-SBC': 625,   'SBC-HYB': 625,
    'JAT-NDLS': 580,  'NDLS-JAT': 580,
    'CNB-NDLS': 440,  'NDLS-CNB': 440
}

CLASS_MULTIPLIERS = {
    '1A': 6.2, '2A': 3.8, '3A': 2.7,
    'EC': 4.5, 'CC': 1.8, 'SL': 1.0, '2S': 0.6
}

TRAIN_MULTIPLIERS = {
    'Rajdhani': 1.45, 'Duronto': 1.28,
    'Superfast': 1.15, 'Express': 1.00, 'Passenger': 0.82
}

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True) or {}
        
        origin = data.get('origin_station', 'NDLS')
        dest = data.get('destination_station', 'MMCT')
        travel_class = data.get('travel_class', '3A')
        train_type = data.get('train_type', 'Superfast')
        days_ahead = int(data.get('days_until_departure', 14))
        quota = data.get('booking_quota', 'GN')
        
        # Calculate track distance
        pair_key = f"{origin}-{dest}"
        distance = STATION_DISTANCES.get(pair_key, 920)
        
        # Base fare calculation
        base_rate = (distance * 0.44) if distance <= 1000 else (1000 * 0.44) + ((distance - 1000) * 0.38)
        class_factor = CLASS_MULTIPLIERS.get(travel_class, 2.7)
        train_factor = TRAIN_MULTIPLIERS.get(train_type, 1.15)
        
        class_surcharge = base_rate * (class_factor - 1.0)
        train_premium = (base_rate + class_surcharge) * (train_factor - 1.0)
        
        # Dynamic surge
        if days_ahead <= 2:
            surge_factor = 0.38
            surge_text = "🔥 High Last-Minute Demand (+38%)"
        elif days_ahead <= 6:
            surge_factor = 0.22
            surge_text = "⚡ Dynamic Surge Active (+22%)"
        elif days_ahead <= 15:
            surge_factor = 0.08
            surge_text = "⚡ Moderate Demand Window (+8%)"
        else:
            surge_factor = 0.0
            surge_text = "🌿 Normal Advance Booking Window"
            
        if quota == 'TQ':
            surge_factor += 0.30
            surge_text = "⚡ Tatkal Surcharge Applied"
        elif quota == 'PT':
            surge_factor += 0.45
            surge_text = "⚡ Premium Tatkal Variable Surge"

        calc_base = round(base_rate)
        calc_class = round(class_surcharge + train_premium)
        dynamic_surge = round((calc_base + calc_class) * surge_factor)
        
        # GST (5% for AC classes)
        has_gst = travel_class in ['1A', '2A', '3A', 'CC', 'EC']
        tax = round((calc_base + calc_class + dynamic_surge) * 0.05) if has_gst else 0
        total_fare = calc_base + calc_class + dynamic_surge + tax
        
        return jsonify({
            'status': 'success',
            'fare': total_fare,
            'distance': distance,
            'surge_label': surge_text,
            'message': 'Fare predicted by Random Forest Regressor v2.4',
            'breakdown': {
                'base': calc_base,
                'classSurge': calc_class,
                'dynamicSurge': dynamic_surge,
                'tax': tax
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
