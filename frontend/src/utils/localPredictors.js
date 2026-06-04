/**
 * Client-Side AI/ML Fallback Engines
 * Used when the Flask ML service on port 5005 is offline (e.g., deployed in production/Vercel)
 */

export function localPredictDiabetes(data) {
  const age = parseFloat(data.Age ?? 45);
  const bmi = parseFloat(data.BMI ?? 24.5);
  const systolic_bp = parseFloat(data.SystolicBP ?? 120);
  const diastolic_bp = parseFloat(data.DiastolicBP ?? 80);
  const hba1c = parseFloat(data.HbA1c ?? 5.5);
  const blood_glucose = parseFloat(data.BloodGlucose ?? 100);
  const genetically_predisposed = parseInt(data.GeneticallyPredisposed ?? 0);
  const physical_activity = parseFloat(data.PhysicalActivity ?? 5);
  const smoking = parseInt(data.Smoking ?? 0);

  // Mathematical logic representing the Random Forest Sigmoid scoring used in Flask
  const score = (
    -8.5 
    + 0.03 * age 
    + 0.11 * bmi 
    + 0.01 * systolic_bp 
    + 0.85 * hba1c 
    + 0.018 * blood_glucose 
    + 0.9 * genetically_predisposed 
    - 0.12 * physical_activity 
    + 0.6 * smoking
  );
  
  const prob = 1 / (1 + Math.exp(-score));
  const risk_score = Math.round(prob * 1000) / 10; // Round to 1 decimal

  let category = "Low Risk";
  if (risk_score > 60) {
    category = "High Risk";
  } else if (risk_score > 30) {
    category = "Moderate Risk";
  }

  const suggestions = [];
  if (risk_score > 30) {
    suggestions.push("Limit intake of refined carbohydrates, soda, and high-sugar desserts.");
    suggestions.push("Incorporate at least 30 minutes of aerobic exercise (walking, swimming, cycling) daily.");
    suggestions.push("Work on weight management; a reduction of 5-7% body weight significantly lowers risk.");
    if (hba1c > 6.0) {
      suggestions.push("Consult an endocrinologist to discuss a clinical diabetes management plan.");
    }
  } else {
    suggestions.push("Keep up your healthy lifestyle! Continue eating fiber-rich foods.");
    suggestions.push("Maintain an active routine with regular physical activity.");
  }

  if (blood_glucose > 140) {
    suggestions.push("Your fasting/post-meal glucose is elevated. Consider continuous glucose monitoring.");
  }
  if (smoking === 1) {
    suggestions.push("Quit smoking. Nicotine increases insulin resistance and elevates cardiac risk.");
  }

  return {
    success: true,
    risk_score,
    category,
    suggestions
  };
}

export function localPredictHeart(data) {
  const age = parseFloat(data.Age ?? 50);
  const sex = parseInt(data.Sex ?? 1);
  const chest_pain = parseInt(data.ChestPainType ?? 0);
  const resting_bp = parseFloat(data.RestingBP ?? 120);
  const cholesterol = parseFloat(data.Cholesterol ?? 200);
  const fasting_bs = parseInt(data.FastingBS ?? 0);
  const resting_ecg = parseInt(data.RestingECG ?? 0);
  const max_hr = parseFloat(data.MaxHR ?? 150);
  const exercise_angina = parseInt(data.ExerciseAngina ?? 0);

  // Mathematical logic representing the Random Forest Sigmoid scoring used in Flask
  const score = (
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
  );

  const prob = 1 / (1 + Math.exp(-score));
  const risk_score = Math.round(prob * 1000) / 10; // Round to 1 decimal

  let category = "Low Risk";
  if (risk_score > 60) {
    category = "High Risk";
  } else if (risk_score > 30) {
    category = "Moderate Risk";
  }

  const suggestions = [];
  if (risk_score > 30) {
    suggestions.push("Transition to a heart-healthy diet such as the Mediterranean Diet (olive oil, fish, vegetables).");
    suggestions.push("Limit dietary cholesterol, sodium (salt), and saturated fat consumption.");
    suggestions.push("Start a supervised moderate exercise regime, targeting a heart rate within a safe zone.");
    if (cholesterol > 240) {
      suggestions.push("Schedule a lipid panel checkup to see if statins or dietary adjusters are needed.");
    }
  } else {
    suggestions.push("Your heart statistics are excellent! Maintain low fat, low sodium, and high antioxidant foods.");
    suggestions.push("Ensure you get routine cardio workouts to keep blood vessels flexible.");
  }

  if (resting_bp > 140) {
    suggestions.push("Your resting blood pressure is high. Practice daily mindfulness and consult a physician.");
  }
  if (exercise_angina === 1 || chest_pain > 0) {
    suggestions.push("Chest discomfort or exercise angina is a direct warning sign. Schedule a stress test or ECG immediately.");
  }

  return {
    success: true,
    risk_score,
    category,
    suggestions
  };
}

export function localAnalyzeSymptoms(symptomsList) {
  const symptoms = symptomsList.map(s => s.trim().toLowerCase());
  
  if (symptoms.length === 0) {
    return {
      success: false,
      error: "No symptoms selected."
    };
  }

  const symptom_db = {
    "headache": [
      { condition: "Migraine / Tension Headache", weight: 4, severity: "Mild to Moderate" },
      { condition: "Hypertension (High BP)", weight: 2, severity: "Moderate" },
      { condition: "Dehydration / Exhaustion", weight: 3, severity: "Mild" }
    ],
    "fever": [
      { condition: "Influenza (Flu) / Viral Infection", weight: 5, severity: "Moderate" },
      { condition: "Common Cold", weight: 2, severity: "Mild" },
      { condition: "Bacterial Infection", weight: 3, severity: "Moderate" }
    ],
    "cough": [
      { condition: "Bronchitis", weight: 4, severity: "Moderate" },
      { condition: "Common Cold", weight: 3, severity: "Mild" },
      { condition: "Asthma flare-up", weight: 2, severity: "Moderate" }
    ],
    "chest pain": [
      { condition: "Angina / Coronary Heart Disease", weight: 5, severity: "CRITICAL / EMERGENCY" },
      { condition: "Acid Reflux / GERD", weight: 2, severity: "Mild" },
      { condition: "Panic Attack / Anxiety", weight: 2, severity: "Mild" }
    ],
    "fatigue": [
      { condition: "Anemia (Iron Deficiency)", weight: 3, severity: "Mild" },
      { condition: "Chronic Fatigue Syndrome", weight: 2, severity: "Moderate" },
      { condition: "Diabetes (Metabolic Deficit)", weight: 3, severity: "Moderate" },
      { condition: "Dehydration / Exhaustion", weight: 2, severity: "Mild" }
    ],
    "shortness of breath": [
      { condition: "Asthma / Respiratory infection", weight: 4, severity: "Moderate to Severe" },
      { condition: "Cardiovascular Strain", weight: 4, severity: "Severe" },
      { condition: "Panic Attack / Anxiety", weight: 2, severity: "Mild" }
    ],
    "nausea": [
      { condition: "Gastroenteritis (Food Poisoning)", weight: 4, severity: "Moderate" },
      { condition: "Acid Reflux / GERD", weight: 2, severity: "Mild" },
      { condition: "Migraine", weight: 2, severity: "Mild" }
    ]
  };

  const condition_scores = {};

  for (const symptom of symptoms) {
    if (symptom in symptom_db) {
      for (const item of symptom_db[symptom]) {
        const cond = item.condition;
        if (!condition_scores[cond]) {
          condition_scores[cond] = { score: 0, severity: item.severity, matches: [] };
        }
        condition_scores[cond].score += item.weight;
        condition_scores[cond].matches.push(symptom);
      }
    }
  }

  if (Object.keys(condition_scores).length === 0) {
    return {
      success: true,
      health_score: 85,
      possible_conditions: [
        {
          condition: "General Viral / Fatigue Syndrome",
          match_percentage: 40,
          severity: "Mild",
          description: "Symptoms logged are non-specific. Rest and check your hydration tracker."
        }
      ],
      recommendations: [
        "Keep logs of your temperature and pain levels.",
        "Ensure adequate hydration (2.5L+).",
        "If symptoms persist or worsen, please schedule an appointment with a general practitioner."
      ]
    };
  }

  const results = [];
  const max_total_weight = symptoms.length * 5;

  for (const [cond, val] of Object.entries(condition_scores)) {
    const pct = Math.min(Math.round((val.score / max_total_weight) * 100), 95);
    results.push({
      condition: cond,
      match_percentage: pct,
      severity: val.severity,
      matched_symptoms: val.matches
    });
  }

  results.sort((a, b) => b.match_percentage - a.match_percentage);

  // Calculate health score: 100 - (sum of weights * factor)
  let total_weight = 0;
  for (const symptom of symptoms) {
    if (symptom in symptom_db) {
      total_weight += symptom_db[symptom][0].weight;
    }
  }
  const health_score = Math.max(100 - (total_weight * 3), 15);

  const recommendations = [
    "Log your daily metrics, focusing on sleep and resting heart rate.",
    "Stay well-hydrated to help clear toxins and support metabolic recovery."
  ];

  const has_critical = results.some(r => r.severity === "CRITICAL / EMERGENCY");
  if (has_critical) {
    recommendations.unshift("⚠️ IMMEDIATE ALERT: Chest pain is detected. Refrain from heavy physical strain and contact emergency medical networks immediately if it feels heavy or radiating.");
  } else if (health_score < 70) {
    recommendations.unshift("Schedule a primary care screening. Continuous low health scores indicate potential fatigue or infection.");
  }

  return {
    success: true,
    health_score,
    possible_conditions: results.slice(0, 3),
    recommendations
  };
}

export function localChatbot(message) {
  const user_message = message.trim().toLowerCase();

  if (!user_message) {
    return {
      success: true,
      reply: "Please send a message. I am here to help!"
    };
  }

  let reply = "";
  if (user_message.includes("hello") || user_message.includes("hi")) {
    reply = "Hello! I am MediMind AI, your clinical health assistant. How can I help you today?";
  } else if (user_message.includes("diabetes")) {
    reply = "Diabetes is characterized by high blood glucose levels. Common symptoms include increased thirst, frequent urination, weight loss, and fatigue. You can compute your risk on our 'Prediction Reports' page!";
  } else if (user_message.includes("heart")) {
    reply = "Cardiovascular wellness is essential. Eat low-sodium meals, engage in regular aerobic exercise, and monitor your resting heart rate. Try checking your cardiovascular risk index in the 'Prediction Reports' tab!";
  } else if (user_message.includes("headache") || user_message.includes("fever") || user_message.includes("cough") || user_message.includes("symptom")) {
    reply = "If you are experiencing active symptoms like fever, cough, or headache, you can check them on our 'Symptom Checker' tab for a customized severity assessment and recommendations.";
  } else if (user_message.includes("diet") || user_message.includes("eat") || user_message.includes("nutrition")) {
    reply = "For general nutrition, we recommend a balanced plate with high fiber, lean proteins, and low processed sugars. For cardiovascular health, a Mediterranean diet is highly recommended.";
  } else if (user_message.includes("exercise") || user_message.includes("workout")) {
    reply = "Aim for at least 150 minutes of moderate aerobic activity (e.g. brisk walking) or 75 minutes of vigorous activity weekly, combined with muscle-strengthening exercises 2 days a week.";
  } else if (user_message.includes("thank")) {
    reply = "You are very welcome! If you have any other questions, feel free to ask. Stay healthy!";
  } else {
    reply = "I understand you are asking about healthcare options. While the full ML model is running in offline demo mode, you can use our diagnostic forms in the 'Symptom Checker' or 'Prediction Reports' tabs for specific risk indicators!";
  }

  return {
    success: true,
    reply
  };
}
