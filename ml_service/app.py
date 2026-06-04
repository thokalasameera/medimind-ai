import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing for easy React integration

# Helper variables to store loaded models
diabetes_model = None
heart_disease_model = None
chatbot_model = None

def find_model_path(model_name):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    path1 = os.path.join(base_dir, '../models', model_name)
    if os.path.exists(path1):
        return path1
    path2 = os.path.join('models', model_name)
    if os.path.exists(path2):
        return path2
    path3 = os.path.join('..', 'models', model_name)
    if os.path.exists(path3):
        return path3
    return None

def load_models():
    global diabetes_model, heart_disease_model, chatbot_model
    try:
        diabetes_path = find_model_path('diabetes_model.pkl')
        if diabetes_path:
            diabetes_model = joblib.load(diabetes_path)
            print(f"Loaded Diabetes Risk model successfully from: {diabetes_path}")
        else:
            print("WARNING: Diabetes model not found. Run train_models.py first.")
            
        heart_path = find_model_path('heart_disease_model.pkl')
        if heart_path:
            heart_disease_model = joblib.load(heart_path)
            print(f"Loaded Heart Disease model successfully from: {heart_path}")
        else:
            print("WARNING: Heart disease model not found. Run train_models.py first.")
            
        chatbot_path = find_model_path('chatbot_model.pkl')
        if chatbot_path:
            chatbot_model = joblib.load(chatbot_path)
            print(f"Loaded Chatbot intelligence matrix successfully from: {chatbot_path}")
        else:
            print("WARNING: Chatbot knowledge model not found. Run train_models.py first.")
    except Exception as e:
        print(f"Error loading machine learning models: {e}")

# Load models at startup
load_models()

# ----------------------------------------------------
# 1. DIABETES PREDICTION ENDPOINT
# ----------------------------------------------------
@app.route('/predict/diabetes', methods=['POST'])
def predict_diabetes():
    global diabetes_model
    try:
        data = request.get_json()
        
        # Extract features
        age = float(data.get('Age', 45))
        bmi = float(data.get('BMI', 24.5))
        systolic_bp = float(data.get('SystolicBP', 120))
        diastolic_bp = float(data.get('DiastolicBP', 80))
        hba1c = float(data.get('HbA1c', 5.5))
        blood_glucose = float(data.get('BloodGlucose', 100))
        genetically_predisposed = int(data.get('GeneticallyPredisposed', 0))
        physical_activity = float(data.get('PhysicalActivity', 5))
        smoking = int(data.get('Smoking', 0))
        
        # Fallback if model not trained
        if diabetes_model is None:
            # Rule-based calculation for graceful mock-up
            score = (
                -8.5 
                + 0.03 * age 
                + 0.11 * bmi 
                + 0.01 * systolic_bp 
                + 0.85 * hba1c 
                + 0.018 * blood_glucose 
                + 0.9 * genetically_predisposed 
                - 0.12 * physical_activity 
                + 0.6 * smoking
            )
            prob = 1 / (1 + np.exp(-score))
            risk_score = round(prob * 100, 1)
        else:
            # Predict using Random Forest
            features = pd.DataFrame([[
                age, bmi, systolic_bp, diastolic_bp, hba1c, 
                blood_glucose, genetically_predisposed, physical_activity, smoking
            ]], columns=[
                'Age', 'BMI', 'SystolicBP', 'DiastolicBP', 'HbA1c', 
                'BloodGlucose', 'GeneticallyPredisposed', 'PhysicalActivity', 'Smoking'
            ])
            prob = diabetes_model.predict_proba(features)[0][1]
            risk_score = round(prob * 100, 1)
            
        # Determine category and generate suggestions
        category = "Low Risk"
        if risk_score > 60:
            category = "High Risk"
        elif risk_score > 30:
            category = "Moderate Risk"
            
        suggestions = []
        if risk_score > 30:
            suggestions.append("Limit intake of refined carbohydrates, soda, and high-sugar desserts.")
            suggestions.append("Incorporate at least 30 minutes of aerobic exercise (walking, swimming, cycling) daily.")
            suggestions.append("Work on weight management; a reduction of 5-7% body weight significantly lowers risk.")
            if hba1c > 6.0:
                suggestions.append("Consult an endocrinologist to discuss a clinical diabetes management plan.")
        else:
            suggestions.append("Keep up your healthy lifestyle! Continue eating fiber-rich foods.")
            suggestions.append("Maintain an active routine with regular physical activity.")
            
        if blood_glucose > 140:
            suggestions.append("Your fasting/post-meal glucose is elevated. Consider continuous glucose monitoring.")
        if smoking == 1:
            suggestions.append("Quit smoking. Nicotine increases insulin resistance and elevates cardiac risk.")
            
        return jsonify({
            "success": True,
            "risk_score": risk_score,
            "category": category,
            "suggestions": suggestions
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ----------------------------------------------------
# 2. HEART DISEASE PREDICTION ENDPOINT
# ----------------------------------------------------
@app.route('/predict/heart', methods=['POST'])
def predict_heart():
    global heart_disease_model
    try:
        data = request.get_json()
        
        # Extract features
        age = float(data.get('Age', 50))
        sex = int(data.get('Sex', 1)) # 0: Female, 1: Male
        chest_pain = int(data.get('ChestPainType', 0)) # 0-3
        resting_bp = float(data.get('RestingBP', 120))
        cholesterol = float(data.get('Cholesterol', 200))
        fasting_bs = int(data.get('FastingBS', 0))
        resting_ecg = int(data.get('RestingECG', 0))
        max_hr = float(data.get('MaxHR', 150))
        exercise_angina = int(data.get('ExerciseAngina', 0))
        
        # Fallback if model not trained
        if heart_disease_model is None:
            score = (
                -6.5
                + 0.04 * age
                + 0.6 * sex
                + 0.5 * chest_pain
                + 0.012 * resting_bp
                + 0.008 * cholesterol
                + 0.5 * fasting_bs
                + 0.2 * resting_ecg
                - 0.02 * max_hr
                + 1.1 * exercise_angina
            )
            prob = 1 / (1 + np.exp(-score))
            risk_score = round(prob * 100, 1)
        else:
            # Predict using Random Forest
            features = pd.DataFrame([[
                age, sex, chest_pain, resting_bp, cholesterol,
                fasting_bs, resting_ecg, max_hr, exercise_angina
            ]], columns=[
                'Age', 'Sex', 'ChestPainType', 'RestingBP', 'Cholesterol',
                'FastingBS', 'RestingECG', 'MaxHR', 'ExerciseAngina'
            ])
            prob = heart_disease_model.predict_proba(features)[0][1]
            risk_score = round(prob * 100, 1)
            
        category = "Low Risk"
        if risk_score > 60:
            category = "High Risk"
        elif risk_score > 30:
            category = "Moderate Risk"
            
        suggestions = []
        if risk_score > 30:
            suggestions.append("Transition to a heart-healthy diet such as the Mediterranean Diet (olive oil, fish, vegetables).")
            suggestions.append("Limit dietary cholesterol, sodium (salt), and saturated fat consumption.")
            suggestions.append("Start a supervised moderate exercise regime, targeting a heart rate within a safe zone.")
            if cholesterol > 240:
                suggestions.append("Schedule a lipid panel checkup to see if statins or dietary adjusters are needed.")
        else:
            suggestions.append("Your heart statistics are excellent! Maintain low fat, low sodium, and high antioxidant foods.")
            suggestions.append("Ensure you get routine cardio workouts to keep blood vessels flexible.")
            
        if resting_bp > 140:
            suggestions.append("Your resting blood pressure is high. Practice daily mindfulness and consult a physician.")
        if exercise_angina == 1 or chest_pain > 0:
            suggestions.append("Chest discomfort or exercise angina is a direct warning sign. Schedule a stress test or ECG immediately.")
            
        return jsonify({
            "success": True,
            "risk_score": risk_score,
            "category": category,
            "suggestions": suggestions
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ----------------------------------------------------
# 3. AI CHATBOT COMPANION ENDPOINT
# ----------------------------------------------------
@app.route('/chatbot', methods=['POST'])
def chatbot_assistant():
    global chatbot_model
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip().lower()
        
        if not user_message:
            return jsonify({
                "success": True,
                "reply": "Please send a message. I am here to help!"
            })
            
        if chatbot_model is None:
            # Fallback very simple keyword engine if not trained
            if "hello" in user_message or "hi" in user_message:
                reply = "Hello! I am MediMind AI, your futuristic health assistant. How can I help you today?"
            elif "diabetes" in user_message:
                reply = "Diabetes is characterized by high blood glucose levels. Common symptoms include increased urination, weight loss, and fatigue. You can check your risk on our Reports page!"
            elif "heart" in user_message:
                reply = "Cardiovascular wellness is key. Eat low-sodium meals, exercise, and check your blood pressure regularly."
            else:
                reply = "I understand you are asking about health. To provide accurate predictive analytics, please explore the Symptom Checker or Prediction Reports!"
        else:
            # Cosine similarity using TF-IDF
            vectorizer = chatbot_model['vectorizer']
            matrix = chatbot_model['matrix']
            answers = chatbot_model['answers']
            
            user_vec = vectorizer.transform([user_message])
            similarities = cosine_similarity(user_vec, matrix)[0]
            max_idx = np.argmax(similarities)
            max_score = similarities[max_idx]
            
            if max_score > 0.2:
                reply = answers[max_idx]
            else:
                # Dynamic Medical Expert Fallback
                reply = (
                    "I am analyzing your query with my AI index. While I don't have a matching database response, "
                    "I recommend checking our predictive modules or consulting with a healthcare professional. "
                    "For emergencies, please use our quick-access Emergency Alert features immediately!"
                )
                
        return jsonify({
            "success": True,
            "reply": reply
        })
        
    except Exception as e:
        return jsonify({"success": False, "reply": f"MediMind system error: {str(e)}"}), 400


# ----------------------------------------------------
# 4. SYMPTOM ANALYZER ENGINE ENDPOINT
# ----------------------------------------------------
@app.route('/analyze-symptoms', methods=['POST'])
def analyze_symptoms():
    try:
        data = request.get_json()
        symptoms = [s.strip().lower() for s in data.get('symptoms', [])]
        
        if not symptoms:
            return jsonify({
                "success": False,
                "error": "No symptoms selected."
            })
            
        # Dictionary linking symptoms to conditions
        symptom_db = {
            "headache": [
                {"condition": "Migraine / Tension Headache", "weight": 4, "severity": "Mild to Moderate"},
                {"condition": "Hypertension (High BP)", "weight": 2, "severity": "Moderate"},
                {"condition": "Dehydration / Exhaustion", "weight": 3, "severity": "Mild"}
            ],
            "fever": [
                {"condition": "Influenza (Flu) / Viral Infection", "weight": 5, "severity": "Moderate"},
                {"condition": "Common Cold", "weight": 2, "severity": "Mild"},
                {"condition": "Bacterial Infection", "weight": 3, "severity": "Moderate"}
            ],
            "cough": [
                {"condition": "Bronchitis", "weight": 4, "severity": "Moderate"},
                {"condition": "Common Cold", "weight": 3, "severity": "Mild"},
                {"condition": "Asthma flare-up", "weight": 2, "severity": "Moderate"}
            ],
            "chest pain": [
                {"condition": "Angina / Coronary Heart Disease", "weight": 5, "severity": "CRITICAL / EMERGENCY"},
                {"condition": "Acid Reflux / GERD", "weight": 2, "severity": "Mild"},
                {"condition": "Panic Attack / Anxiety", "weight": 2, "severity": "Mild"}
            ],
            "fatigue": [
                {"condition": "Anemia (Iron Deficiency)", "weight": 3, "severity": "Mild"},
                {"condition": "Chronic Fatigue Syndrome", "weight": 2, "severity": "Moderate"},
                {"condition": "Diabetes (Metabolic Deficit)", "weight": 3, "severity": "Moderate"},
                {"condition": "Dehydration / Exhaustion", "weight": 2, "severity": "Mild"}
            ],
            "shortness of breath": [
                {"condition": "Asthma / Respiratory infection", "weight": 4, "severity": "Moderate to Severe"},
                {"condition": "Cardiovascular Strain", "weight": 4, "severity": "Severe"},
                {"condition": "Panic Attack / Anxiety", "weight": 2, "severity": "Mild"}
            ],
            "nausea": [
                {"condition": "Gastroenteritis (Food Poisoning)", "weight": 4, "severity": "Moderate"},
                {"condition": "Acid Reflux / GERD", "weight": 2, "severity": "Mild"},
                {"condition": "Migraine", "weight": 2, "severity": "Mild"}
            ]
        }
        
        # Calculate scoring matches
        condition_scores = {}
        matched_count = 0
        
        for symptom in symptoms:
            if symptom in symptom_db:
                matched_count += 1
                for item in symptom_db[symptom]:
                    cond = item["condition"]
                    if cond not in condition_scores:
                        condition_scores[cond] = {"score": 0, "severity": item["severity"], "matches": []}
                    condition_scores[cond]["score"] += item["weight"]
                    condition_scores[cond]["matches"].append(symptom)
                    
        # If no matched symptoms in our database, return a general warning
        if not condition_scores:
            return jsonify({
                "success": True,
                "health_score": 85,
                "possible_conditions": [
                    {
                        "condition": "General Viral / Fatigue Syndrome",
                        "match_percentage": 40,
                        "severity": "Mild",
                        "description": "Symptoms logged are non-specific. Rest and check your hydration tracker."
                    }
                ],
                "recommendations": [
                    "Keep logs of your temperature and pain levels.",
                    "Ensure adequate hydration (2.5L+).",
                    "If symptoms persist or worsen, please schedule an appointment with a general practitioner."
                ]
            })
            
        # Format possible conditions
        results = []
        max_total_weight = len(symptoms) * 5
        
        for cond, val in condition_scores.items():
            # Percentage based on weight and number of matches
            pct = min(round((val["score"] / max_total_weight) * 100), 95)
            # Add premium visual flag for severe/critical elements
            results.append({
                "condition": cond,
                "match_percentage": pct,
                "severity": val["severity"],
                "matched_symptoms": val["matches"]
            })
            
        # Sort by match percentage descending
        results = sorted(results, key=lambda x: x["match_percentage"], reverse=True)
        
        # Calculate health score: 100 - (sum of weights * factor)
        total_weight = sum([symptom_db[s][0]["weight"] for s in symptoms if s in symptom_db])
        health_score = max(100 - (total_weight * 3), 15)
        
        # Standard clinical suggestions
        recommendations = [
            "Log your daily metrics, focusing on sleep and resting heart rate.",
            "Stay well-hydrated to help clear toxins and support metabolic recovery."
        ]
        
        # Check if any severe triggers match
        has_critical = any([r["severity"] == "CRITICAL / EMERGENCY" for r in results])
        if has_critical:
            recommendations.insert(0, "⚠️ IMMEDIATE ALERT: Chest pain is detected. Refrain from heavy physical strain and contact emergency medical networks immediately if it feels heavy or radiating.")
        elif health_score < 70:
            recommendations.insert(0, "Schedule a primary care screening. Continuous low health scores indicate potential fatigue or infection.")
            
        return jsonify({
            "success": True,
            "health_score": health_score,
            "possible_conditions": results[:3], # return top 3 matches
            "recommendations": recommendations
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/health', methods=['GET'])
def health_check():
    # Helper to check models status
    return jsonify({
        "status": "online",
        "models": {
            "diabetes": diabetes_model is not None,
            "heart_disease": heart_disease_model is not None,
            "chatbot": chatbot_model is not None
        }
    })

if __name__ == '__main__':
    # Running on 5005 to avoid common standard port collisions (like 5000)
    app.run(host='0.0.0.0', port=5005, debug=True)
