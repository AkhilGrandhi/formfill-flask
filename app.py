from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
import json
from openai import OpenAI

app = Flask(__name__)
CORS(app)

# Setup logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

# Initialize OpenAI GPT client
from openai import OpenAI

# Hardcoded (local only)
OPENAI_API_KEY = "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"
client = OpenAI(api_key=OPENAI_API_KEY)

# ---------------------------
# Sample Data Endpoint
# ---------------------------
@app.route("/sample-data", methods=["GET"])
def get_sample_data():
    """Provides flat sample JSON data for autofilling forms"""
    sample_data = {
        "firstName": "Akhil",
        "lastName": "Grandhi",
        "email": "akhil.grandhi@example.com",
        "phone": "+1 (415) 830-4179",
        "birthdate": "2000-02-09",
        "gender": "Male",
        "nationality": "Indian",
        "citizenshipStatus": "Non-U.S. Citizen",
        "visaStatus": "F1 - Student Visa",
        "workAuthorization": "Authorized to work in the U.S. with sponsorship",
        "willingToRelocate": "Yes",
        "disabilityStatus": "No",
        "veteranStatus": "Not a Veteran",
        "militaryExperience": "No",
        "raceEthnicity": "Asian",

        # Address
        "address1": "H.No. 123, 1st Cross, Gandhi Nagar",
        "address2": "Near Town Hall",
        "city": "San Jose",
        "state": "California",
        "postalCode": "95112",
        "country": "USA",

        # Online profiles
        "website": "https://akhilgrandhi.dev",
        "linkedin": "https://linkedin.com/in/akhilgrandhi",
        "github": "https://github.com/akhilgrandhi",

        # Documents
        "resumeUploaded": True,
        "coverLetterUploaded": True,

        # Preferences
        "desiredSalary": "$90,000 - $100,000",
        "noticePeriod": "2 Weeks",
        "skills": "Python, Java, SQL, HTML, Git, Docker, REST APIs",

        # Work experience
        "company1": "NextGen Softwares",
        "role1": "Full Stack Engineer",
        "fromDate1": "2023-06-01",
        "toDate1": "2025-05-31",
        "company2": "Innovate Tech Solutions",
        "role2": "Software Developer",
        "fromDate2": "2020-01-01",
        "toDate2": "2023-05-31",
        "company3": "Alpha Systems",
        "role3": "Junior Developer",
        "fromDate3": "2018-06-01",
        "toDate3": "2019-12-31",

        # Education
        "degree1": "Bachelor of Technology",
        "fieldOfStudy1": "Computer Science",
        "university1": "Jawaharlal Nehru Technological University",
        "educationLocation1": "Hyderabad, India",
        "degree2": "High School",
        "fieldOfStudy2": "Science",
        "university2": "Sri Chaitanya Junior College",
        "educationLocation2": "Hyderabad, India",

        # References
        "referenceName1": "Suresh Kumar",
        "referenceRelation1": "Manager",
        "referencePhone1": "+1 (415) 555-1234",
        "referenceEmail1": "suresh.kumar@example.com",
        "referenceName2": "Anita Sharma",
        "referenceRelation2": "Team Lead",
        "referencePhone2": "+1 (408) 555-5678",
        "referenceEmail2": "anita.sharma@example.com",

        # Other
        "backgroundCheckConsent": True,
        "willingToTravel": "Yes",
        "howDidYouHearAboutUs": "LinkedIn"
    }

    return jsonify(sample_data)


# ---------------------------
# Form Submission Endpoint
# ---------------------------
@app.route("/submit", methods=["POST"])
def submit():
    try:
        form_data = request.json
        print(form_data)

        if not form_data:
            logging.warning("⚠️ No JSON body received")
            return jsonify({
                "status": "error",
                "message": "No JSON data received"
            }), 400

        return jsonify({
            "status": "success",
            "received_fields": list(form_data.keys())
        })

    except Exception as e:
        logging.error(f"❌ Error processing request: {e}", exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500


# ---------------------------
# GPT Mapping Endpoint
# ---------------------------
@app.route("/gpt-map", methods=["POST"])
def gpt_map():
    try:
        form_json = request.json.get("form", {})

        # Get sample data
        sample_json = json.loads(get_sample_data().data)

        # Prompt to GPT
        prompt = f"""
        You are an assistant that maps form fields to candidate data.

        Form JSON: {form_json}

        Sample Data: {sample_json}

        Rules:
        - Match fields if key names or labels are close (e.g. "Full Name" → firstName/lastName).
        - Use values from sample data wherever possible.
        - Keep output flat (no nested objects).
        - If a field has no match, leave it "" or [] for checkboxes.
        - For checkboxes → return an array.
        - For radios → return a single value.

        Return only valid JSON.
        """

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )

        mapping_raw = response.choices[0].message.content.strip()
        logging.debug(f"GPT Raw Output: {mapping_raw}")

        mapping = json.loads(mapping_raw)
        return jsonify(mapping)

    except Exception as e:
        logging.error(f"❌ Error in /gpt-map: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


# ---------------------------
# Start the Flask App
# ---------------------------
if __name__ == "__main__":
    logging.info("🚀 Starting Flask server on http://127.0.0.1:5000")
    app.run(port=5000, debug=True)
