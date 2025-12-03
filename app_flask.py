from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/health')
def health():
    return jsonify({"ok": True, "service": "flask-example"})

# Simple predict endpoint (placeholder) — returns a dummy prediction
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json or {}
    # In a real app you'd load a model and run predict here
    features = data.get('features', [])
    return jsonify({
        'features_received': features,
        'prediction': 0,
        'note': 'This is a placeholder. Replace with real model code.'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
