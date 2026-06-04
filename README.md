# MediMind AI — Futuristic AI-Powered Healthcare Console

### *"Predict. Prevent. Protect."*

MediMind AI is a state-of-the-art, multi-tier healthcare console designed with a gorgeous dark glassmorphism user interface. This web application predicts chronic health risks using local machine learning classifiers, schedules daily medicine alerts with synthesized alarms, logs tracking metrics, and integrates interactive speech-to-text symptom checker modules.

---

## 🚀 Architectural Overview

MediMind AI employs a decoupled, highly cohesive 3-tier architecture:

```
                  ┌─────────────────────────────────────┐
                  │          Vite + React.js            │
                  │   (Glassmorphism / Framer Motion)   │
                  └──────┬───────────────────────┬──────┘
                         │                       │
                         │ HTTP (Auth/Tracker)   │ HTTP (ML Predictions)
                         ▼                       ▼
            ┌─────────────────────────┐     ┌─────────────────────────┐
            │   Express REST Engine   │     │   Python Flask API      │
            │     (Sequelize ORM)     │     │  (scikit-learn Models)  │
            └────────────┬────────────┘     └─────────────────────────┘
                         │
             SQLite (Default) / MySQL
```

1. **Quantum Frontend (Vite + React.js)**: Features glassmorphic transparent card modules, custom glow borders, smooth Framer Motion floating keyframe animations, interactive Recharts Area graphs, native Web SpeechRecognition dictation, and speech-synthesized readouts.
2. **Core API Server (Express + Node.js)**: Manages secure user registries using hashed `bcryptjs` algorithms, JWT session authentication gates, active reminders scheduling, and daily tracking parameters. Employs Sequelize ORM for dual-database compatibility (SQLite/MySQL).
3. **AI/ML Analytics Node (Flask + Python)**: Dynamically generates statistical datasets, trains Random Forest classification classifiers, compiles a vector TF-IDF NLP medical chatbot companion, and serves REST query endpoints.

---

## 🔬 AI/ML Intelligence Telemetry

### 1. Diabetes Risk Predictor (Random Forest Classifier)
Computes metabolic risks by classifying indices against standard physiological vectors:
* **Inputs**: Age, BMI, Blood Pressure (Systolic/Diastolic), HbA1c Level, Fasting Blood Glucose, Genetic Predisposition (Family history), Physical Workouts (Hours/week), and Smoking history.
* **Output**: Real-time probability index (%) + personalized dietary boundaries.

### 2. Cardiovascular Risk Predictor (Random Forest Classifier)
Predicts cardiovascular warnings using key clinical data:
* **Inputs**: Age, Biological Sex, Chest Pain Discomfort Type (Asymptomatic, Atypical, Non-Anginal, Typical Angina), Resting BP, Serum Cholesterol, Fasting Blood Sugar, Resting ECG, Max Heart Rate achieved, and Exercise-Induced Angina.
* **Output**: Dynamic risk percentage (%) + critical heart protection advice.

### 3. AI NLP Medical Chatbot Companion
Uses a local TF-IDF vectorizer + Cosine Similarity index running over a curated database of clinical Q&As. If user questions query custom terms (e.g. fever, headache, exercise, hydration), it returns highly accurate medical advice. It runs 100% offline without requiring internet connections or expensive API keys!

### 4. Speech-to-Text Symptom Checker
Integrates Web SpeechRecognition to let patients dictate symptoms. The backend maps inputs to potential conditions (Bronchitis, Migraines, Angina, Anemia), scores overall health, and alerts users if critical parameters (like chest pains) are registered.

---

## 🛠️ Instant Zero-Config Setup (Windows)

MediMind AI includes a double-clickable launcher script that automates installations and local model training!

### Prerequisites
* **Node.js** (v18+ recommended)
* **Python** (v3.9+ with `pip`)

### ⚡ Start the Console
1. Double-click the **`run.bat`** file located in the root of the project directory.
2. The launcher will automatically:
   * Install Python packages (`flask`, `scikit-learn`, `numpy`, `pandas`, `joblib`, `flask-cors`).
   * **Train and compile the ML models locally** (saving files in `ml_service/models/`).
   * Install Express Node.js and React Vite dependencies.
   * Boot up all three microservices in separate dedicated command prompts.
3. Open your browser and navigate to: **`http://localhost:5173`**
4. Register a new profile to begin!

---

## 🛢️ Connecting to MySQL (Optional)

By default, the backend uses **SQLite** (saving the database to `backend/database.sqlite` automatically). This requires zero database setups!

To connect the console to a **MySQL** server:
1. Start your local MySQL server.
2. Create an empty database in MySQL named `medimind_db`.
3. Open `backend/.env` in an editor.
4. Modify the database parameters as follows:
   ```env
   # Switch dialect from 'sqlite' to 'mysql'
   DB_DIALECT=mysql

   # Uncomment and adjust your MySQL credentials:
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASS=your_mysql_password
   DB_NAME=medimind_db
   ```
5. Restart your launcher. Sequelize ORM will automatically establish connections and generate all database schemas!

---

## 🎵 Special High-Tech Features
* **Circadian Voice Readouts**: Symptoms Checker results are vocalized aloud using browser SpeechSynthesis.
* **Web Audio Sound Alarm**: Medicine reminders match current local time, flashing a warning banner and synthesizing electronic alarm tones in your sound card directly via HTML5 Web Audio oscillators.
* **Circadian Graph Backfill**: New user accounts are seeded with 7 days of realistic biometric data (hydration/sleep logs) to immediately render vibrant animated graphs upon first boot!

---

## 📄 License

MIT License — Free to use, modify, and distribute.
