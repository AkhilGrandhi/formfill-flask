from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

# Setup logging
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s [%(levelname)s] %(message)s")

@app.route("/submit", methods=["POST"])
def submit():
    # logging.info("📩 Received request at /submit")
    
    try:
        form_data = request.json
        print(form_data)
        # logging.debug(f"📝 Raw request JSON: {form_data}")
        
        if not form_data:
            logging.warning("⚠️ No JSON body received")
            return jsonify({"status": "error", "message": "No JSON data received"}), 400
        
        # logging.info(f"✅ Received {len(form_data)} fields: {list(form_data.keys())}")
        return jsonify({"status": "success", "received_fields": list(form_data.keys())})
    
    except Exception as e:
        logging.error(f"❌ Error processing request: {e}", exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/sample-data", methods=["GET"])
def get_sample_data():
    sample_data = {
        "fullName": "John Doe",
        "email": "johndoe@example.com",
        "phone": "+1234567890",
        "address": "123 Main St, Springfield, IL 62701",
        "website": "https://johndoeportfolio.com",
        "birthdate": "1985-07-15",
        "meetingTime": "14:30",
        "country": "US",
        "experience": "6-10",
        "employmentType": "full-time",
        "remoteWork": "hybrid",
        "skills": ["javascript", "react"],
        "notifications": ["email", "sms"]
    }
    return jsonify(sample_data)

if __name__ == "__main__":
    logging.info("🚀 Starting Flask server on http://127.0.0.1:5000")
    app.run(port=5000, debug=True)
