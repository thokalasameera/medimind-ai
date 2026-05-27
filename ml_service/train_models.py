import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib

# Create models directory if it doesn't exist
os.makedirs("models", exist_ok=True)

print("Starting AI/ML model generation & training...")

# ----------------------------------------------------
# 1. GENERATE & TRAIN DIABETES RISK PREDICTION MODEL
# ----------------------------------------------------
print("Generating Diabetes Risk dataset...")
np.random.seed(42)
num_samples = 1500

# Generating features
age = np.random.randint(18, 80, num_samples)
bmi = np.random.uniform(15, 45, num_samples)
systolic_bp = np.random.randint(90, 180, num_samples)
diastolic_bp = np.random.randint(60, 110, num_samples)
hba1c = np.random.uniform(4.0, 9.5, num_samples)
blood_glucose = np.random.uniform(70, 260, num_samples)
genetically_predisposed = np.random.choice([0, 1], size=num_samples, p=[0.6, 0.4])
physical_activity = np.random.uniform(0, 15, num_samples) # hours per week
smoking = np.random.choice([0, 1], size=num_samples, p=[0.75, 0.25])

# Calculate logit for diabetes probability
z_diabetes = (
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
prob_diabetes = 1 / (1 + np.exp(-z_diabetes))
# Convert to binary label
diabetes_label = (prob_diabetes > np.random.uniform(0, 1, num_samples)).astype(int)

# Create DataFrame
diabetes_df = pd.DataFrame({
    'Age': age,
    'BMI': bmi,
    'SystolicBP': systolic_bp,
    'DiastolicBP': diastolic_bp,
    'HbA1c': hba1c,
    'BloodGlucose': blood_glucose,
    'GeneticallyPredisposed': genetically_predisposed,
    'PhysicalActivity': physical_activity,
    'Smoking': smoking,
    'Outcome': diabetes_label
})

# Train Model
X_diab = diabetes_df.drop('Outcome', axis=1)
y_diab = diabetes_df['Outcome']
X_train_d, X_test_d, y_train_d, y_test_d = train_test_split(X_diab, y_diab, test_size=0.2, random_state=42)

diab_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
diab_model.fit(X_train_d, y_train_d)
accuracy_d = diab_model.score(X_test_d, y_test_d)
print(f"Diabetes Model Trained. Accuracy: {accuracy_d:.2f}")

# Save Model
joblib.dump(diab_model, 'models/diabetes_model.pkl')


# ----------------------------------------------------
# 2. GENERATE & TRAIN HEART DISEASE RISK MODEL
# ----------------------------------------------------
print("Generating Heart Disease Risk dataset...")
# Generating features
age_hd = np.random.randint(25, 80, num_samples)
sex_hd = np.random.choice([0, 1], size=num_samples, p=[0.5, 0.5]) # 0: Female, 1: Male
chest_pain_type = np.random.randint(0, 4, num_samples) # 0: asymptomatic, 1: atypical, 2: non-anginal, 3: typical
resting_bp = np.random.randint(90, 185, num_samples)
cholesterol = np.random.uniform(140, 420, num_samples)
fasting_bs = np.random.choice([0, 1], size=num_samples, p=[0.85, 0.15])
resting_ecg = np.random.randint(0, 3, num_samples)
max_hr = 220 - age_hd - np.random.randint(-20, 20, num_samples)
exercise_angina = np.random.choice([0, 1], size=num_samples, p=[0.7, 0.3])

# Calculate logit for heart disease probability
z_heart = (
    -6.5
    + 0.04 * age_hd
    + 0.6 * sex_hd
    + 0.5 * chest_pain_type
    + 0.012 * resting_bp
    + 0.008 * cholesterol
    + 0.5 * fasting_bs
    + 0.2 * resting_ecg
    - 0.02 * max_hr
    + 1.1 * exercise_angina
)
prob_heart = 1 / (1 + np.exp(-z_heart))
heart_label = (prob_heart > np.random.uniform(0, 1, num_samples)).astype(int)

# Create DataFrame
heart_df = pd.DataFrame({
    'Age': age_hd,
    'Sex': sex_hd,
    'ChestPainType': chest_pain_type,
    'RestingBP': resting_bp,
    'Cholesterol': cholesterol,
    'FastingBS': fasting_bs,
    'RestingECG': resting_ecg,
    'MaxHR': max_hr,
    'ExerciseAngina': exercise_angina,
    'Outcome': heart_label
})

# Train Model
X_heart = heart_df.drop('Outcome', axis=1)
y_heart = heart_df['Outcome']
X_train_h, X_test_h, y_train_h, y_test_h = train_test_split(X_heart, y_heart, test_size=0.2, random_state=42)

heart_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
heart_model.fit(X_train_h, y_train_h)
accuracy_h = heart_model.score(X_test_h, y_test_h)
print(f"Heart Disease Model Trained. Accuracy: {accuracy_h:.2f}")

# Save Model
joblib.dump(heart_model, 'models/heart_disease_model.pkl')


# ----------------------------------------------------
# 3. BUILD AI CHATBOT INTELLIGENCE KNOWLEDGE DATABASE
# ----------------------------------------------------
print("Compiling AI Chatbot Medical Knowledge...")

chatbot_data = [
    {
        "questions": ["hello", "hi", "hey", "hlo", "greetings", "good morning", "good afternoon", "anyone there"],
        "answer": "Hello! I am MediMind AI, your futuristic medical assistant. How can I help you predict, prevent, or protect your health today?"
    },
    {
        "questions": ["what are you", "who are you", "what is your name", "tell me about yourself", "who created you"],
        "answer": "I am MediMind AI, a premium futuristic AI-powered medical assistant. I can analyze symptoms, predict risks for diabetes and heart disease, manage your medication schedules, track sleep and hydration metrics, and guide you towards better health!"
    },
    {
        "questions": ["symptoms of diabetes", "diabetes symptoms", "how to know if I have diabetes", "signs of diabetes"],
        "answer": "Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, constant fatigue, blurred vision, slow-healing sores, and frequent infections. Use our Prediction Reports to calculate your statistical risk!"
    },
    {
        "questions": ["prevent heart disease", "heart health tips", "how to protect my heart", "heart disease prevention"],
        "answer": "To protect your heart: eat a nutrient-rich diet (fruits, vegetables, whole grains), exercise for at least 150 minutes a week, keep stress under control, limit alcohol, quit smoking, and closely monitor blood pressure and cholesterol."
    },
    {
        "questions": ["what is the emergency button", "how to use emergency", "what happens in an emergency"],
        "answer": "The Emergency button on the sidebar is an instant-action tool. It displays critical emergency procedures (e.g. CPR, choking, chest pain protocols) and simulates alerts to emergency contacts for instant protective action."
    },
    {
        "questions": ["how to check diabetes risk", "how does diabetes prediction work", "diabetes checker"],
        "answer": "To check your diabetes risk, head to the 'Prediction Reports' page and choose Diabetes. Enter your vitals (Age, BMI, Blood Pressure, HbA1c, and Glucose). Our Random Forest model will compute your dynamic risk percentage and list personalized advice!"
    },
    {
        "questions": ["how to check heart disease", "heart risk calculator", "cardiovascular risk test"],
        "answer": "Go to 'Prediction Reports' and select Heart Disease. Fill in parameters like Age, Chest Pain Type, Resting BP, Cholesterol, and Max Heart Rate. The scikit-learn ML model will generate a health score and risk meter."
    },
    {
        "questions": ["healthy diet tips", "what should I eat", "nutrition advice", "good foods"],
        "answer": "Prioritize a balanced diet rich in leafy greens, berries, lean proteins (fish, chicken, beans), nuts, and seeds. Limit ultra-processed foods, refined sugars, and saturated fats to maintain optimal cardiovascular and metabolic health."
    },
    {
        "questions": ["how much water should I drink", "hydration goals", "water tracker info"],
        "answer": "It is generally recommended to drink 2.5 to 3 liters (approx. 8-10 glasses) of water daily. Hydration improves cellular function, skin health, and energy levels. Use the interactive Water Tracker on your dashboard to log your cups!"
    },
    {
        "questions": ["why is sleep important", "sleep goals", "how much sleep do I need"],
        "answer": "Adults should aim for 7 to 9 hours of quality sleep per night. Sleep repairs muscles, consolidates memory, and regulates critical hormones. Track your sleep quality and sleep hours on our Dashboard Sleep Tracker!"
    },
    {
        "questions": ["what to do if I have high blood pressure", "high bp remedies", "hypertension advice"],
        "answer": "If you have high BP, limit sodium intake, stay physically active, manage stress (try deep breathing or meditation), and limit caffeine. Always consult a physician to discuss proper clinical care."
    },
    {
        "questions": ["fever and headache treatment", "headache remedy", "what to do for fever"],
        "answer": "For mild fevers and headaches, rest in a cool room, drink plenty of fluids, and use a cool damp cloth on your forehead. Over-the-counter relievers like paracetamol/ibuprofen can help, but see a doctor if it persists."
    },
    {
        "questions": ["thank you", "thanks", "great help", "awesome", "perfect"],
        "answer": "You are very welcome! It is my mission to help you Predict, Prevent, and Protect your health. Stay healthy, and let me know if you need anything else!"
    }
]

# Expand chatbot training texts and answers
corpus = []
answer_map = {}

for index, item in enumerate(chatbot_data):
    for q in item["questions"]:
        corpus.append(q)
        answer_map[len(corpus) - 1] = item["answer"]

# Train TF-IDF Vectorizer
vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
tfidf_matrix = vectorizer.fit_transform(corpus)

# Save vectorizer and associated structures
chatbot_model = {
    'vectorizer': vectorizer,
    'matrix': tfidf_matrix,
    'corpus': corpus,
    'answers': answer_map
}
joblib.dump(chatbot_model, 'models/chatbot_model.pkl')

print("Chatbot Knowledge Model Compiled successfully.")
print("All AI/ML models are successfully created and saved in 'ml_service/models/'.")
