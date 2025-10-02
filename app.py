from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
from openai import OpenAI
import json
from openai import OpenAI

app = Flask(__name__)
CORS(app)

# Setup logging
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s [%(levelname)s] %(message)s")

# Hardcoded (local only)
OPENAI_API_KEY = ""
client = OpenAI(api_key=OPENAI_API_KEY)

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

# ---------------------------
# GPT Mapping Endpoint
@app.route("/sample-data", methods=["GET"])
def get_sample_data():
    """
    Provides flat sample JSON data for autofilling forms
    """
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

        "address1": "H.No. 123, 1st Cross, Gandhi Nagar",
        "address2": "Near Town Hall",
        "city": "San Jose",
        "state": "California",
        "postalCode": "95112",
        "country": "USA",

        "website": "https://akhilgrandhi.dev",
        "linkedin": "https://linkedin.com/in/akhilgrandhi",
        "github": "https://github.com/akhilgrandhi",
        "resumeUploaded": True,
        "coverLetterUploaded": True,
        "desiredSalary": "$90,000 - $100,000",
        "noticePeriod": "2 Weeks",

        "skills": "Python, Java, SQL, HTML, Git, Docker, REST APIs",

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

        "degree1": "Bachelor of Technology",
        "fieldOfStudy1": "Computer Science",
        "university1": "Jawaharlal Nehru Technological University",
        "educationLocation1": "Hyderabad, India",

        "degree2": "High School",
        "fieldOfStudy2": "Science",
        "university2": "Sri Chaitanya Junior College",
        "educationLocation2": "Hyderabad, India",

        "referenceName1": "Suresh Kumar",
        "referenceRelation1": "Manager",
        "referencePhone1": "+1 (415) 555-1234",
        "referenceEmail1": "suresh.kumar@example.com",

        "referenceName2": "Anita Sharma",
        "referenceRelation2": "Team Lead",
        "referencePhone2": "+1 (408) 555-5678",
        "referenceEmail2": "anita.sharma@example.com",

        "backgroundCheckConsent": True,
        "willingToTravel": "Yes",
        "howDidYouHearAboutUs": "LinkedIn"
    }
    print("****************************************************************************")
    print(sample_data)
    return jsonify(sample_data)

# ---------------------------
# New GPT Mapping Endpoint
# ---------------------------
@app.route("/gpt-map", methods=["POST"])
def gpt_map():
    try:
        form_json = request.json.get("form", {})

        # Get sample data
        sample_json = json.loads(get_sample_data().data)
        
        print(f"INPUT: {form_json}")
        # Prompt to GPT
        prompt = f"""
        You are an intelligent assistant tasked with completing a form using the provided candidate sample data.

        Form Schema (JSON):
        {form_json}

        Candidate Sample Data:
        {sample_json}

        Instructions:
        - Your goal is to fill out **every possible field** in the form using the most appropriate values from the sample data.
        - Use intelligent matching: compare form field names, labels, IDs, and options against keys or values in the sample data.
        - Populate each form field with the **most relevant and accurate value** from the sample data.
        - Output must be a **flat, minified JSON object** — no nested objects or arrays unless specifically required (e.g., for checkboxes).
        - Follow these field-specific rules:
        - **Text inputs** → Use matching text from sample data.
        - **Dropdowns or radio buttons** → Return a **single string** that best matches the correct option.
        - **Checkboxes** → Return an **array of selected options**.
        - **File uploads** (e.g., resume, cover letter) → Leave blank if no file content is in the sample.
        - If an exact match isn’t found, **infer the most logical value** from context and available options.
        - **Never omit any fields** — all required fields must be filled unless they are file uploads and no data is available.
        - The final output must be **strictly valid JSON**, compact (minified), and contain **no explanations, extra text, or comments**.

        Return only the final completed form as minified JSON.
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


        mapping = json.loads(mapping_raw)  # parse to dict

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
