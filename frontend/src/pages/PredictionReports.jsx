import React, { useState } from 'react';
import { useAuth, API_URL, ML_API_URL } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { 
  TrendingUp, 
  BrainCircuit, 
  HeartPulse, 
  HelpCircle,
  Database,
  Loader,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PredictionReports = () => {
  const { user, token } = useAuth();
  
  const [activeTab, setActiveTab] = useState('diabetes'); // 'diabetes' or 'heart'
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 1. DIABETES STATE PARAMS
  const [diabAge, setDiabAge] = useState(user?.age || 45);
  const [diabBmi, setDiabBmi] = useState(() => {
    if (user?.weight && user?.height) {
      const hM = user.height / 100;
      return roundToOneDecimal(user.weight / (hM * hM));
    }
    return 24.5;
  });
  const [diabSys, setDiabSys] = useState(120);
  const [diabDia, setDiabDia] = useState(80);
  const [diabHba1c, setDiabHba1c] = useState(5.5);
  const [diabGlucose, setDiabGlucose] = useState(100);
  const [diabFamily, setDiabFamily] = useState(0); // 0 or 1
  const [diabActivity, setDiabActivity] = useState(5); // hrs/week
  const [diabSmoking, setDiabSmoking] = useState(0); // 0 or 1

  // 2. HEART DISEASE STATE PARAMS
  const [heartAge, setHeartAge] = useState(user?.age || 50);
  const [heartSex, setHeartSex] = useState(user?.gender?.toLowerCase() === 'female' ? 0 : 1);
  const [heartCp, setHeartCp] = useState(0); // 0: asymptomatic, 1: atypical, 2: non-anginal, 3: typical
  const [heartBp, setHeartBp] = useState(120);
  const [heartChol, setHeartChol] = useState(200);
  const [heartFbs, setHeartFbs] = useState(0); // fasting blood sugar > 120 (0 or 1)
  const [heartEcg, setHeartEcg] = useState(0); // resting ECG (0, 1, 2)
  const [heartMaxHr, setHeartMaxHr] = useState(150);
  const [heartAngina, setHeartAngina] = useState(0); // exercise angina (0 or 1)

  const handleSubmitDiabetes = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReport(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`${ML_API_URL}/predict/diabetes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Age: diabAge,
          BMI: diabBmi,
          SystolicBP: diabSys,
          DiastolicBP: diabDia,
          HbA1c: diabHba1c,
          BloodGlucose: diabGlucose,
          GeneticallyPredisposed: diabFamily,
          PhysicalActivity: diabActivity,
          Smoking: diabSmoking
        })
      });
      const data = await res.json();
      if (data.success) {
        setReport({
          type: 'diabetes',
          score: data.risk_score,
          category: data.category,
          suggestions: data.suggestions,
          inputs: { diabAge, diabBmi, diabGlucose, diabHba1c }
        });
      } else {
        alert("ML service returned an error.");
      }
    } catch (err) {
      alert("Could not communicate with Flask ML service on port 5005. Verify it is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitHeart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReport(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`${ML_API_URL}/predict/heart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Age: heartAge,
          Sex: heartSex,
          ChestPainType: heartCp,
          RestingBP: heartBp,
          Cholesterol: heartChol,
          FastingBS: heartFbs,
          RestingECG: heartEcg,
          MaxHR: heartMaxHr,
          ExerciseAngina: heartAngina
        })
      });
      const data = await res.json();
      if (data.success) {
        setReport({
          type: 'heart',
          score: data.risk_score,
          category: data.category,
          suggestions: data.suggestions,
          inputs: { heartAge, heartChol, heartBp, heartMaxHr }
        });
      } else {
        alert("ML service returned an error.");
      }
    } catch (err) {
      alert("Could not communicate with Flask ML service on port 5005. Verify it is running.");
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    if (!report) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: report.type,
          inputData: report.inputs,
          riskScore: report.score,
          category: report.category,
          suggestions: report.suggestions
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        // Play success confetti!
        confetti({
          particleCount: 80,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#a78bfa', '#22d3ee', '#818cf8']
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to synchronize record.");
    } finally {
      setSaving(false);
    }
  };

  const handleTabToggle = (tab) => {
    setActiveTab(tab);
    setReport(null);
    setSaveSuccess(false);
  };

  // Rounding utility
  function roundToOneDecimal(num) {
    return Math.round(num * 10) / 10;
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-black font-cyber-title text-white">Quantum ML Predictive Reports</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Feed clinical parameters into our Random Forest models to compile disease risk telemetry.
          </p>
        </div>

        {/* Dynamic Dual-Tab Swapper */}
        <div className="flex bg-slate-900/60 border border-slate-200/10 dark:border-slate-800/30 rounded-xl p-1 font-mono text-xs max-w-sm flex-shrink-0">
          <button
            onClick={() => handleTabToggle('diabetes')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all duration-300
              ${activeTab === 'diabetes' 
                ? 'bg-neon-cyan/15 text-neon-cyan shadow-sm shadow-neon-cyan' 
                : 'text-slate-400 hover:text-white'
              }
            `}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Diabetes Risk</span>
          </button>
          
          <button
            onClick={() => handleTabToggle('heart')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all duration-300
              ${activeTab === 'heart' 
                ? 'bg-neon-purple/15 text-neon-purple shadow-sm shadow-neon-purple' 
                : 'text-slate-400 hover:text-white'
              }
            `}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Heart Disease</span>
          </button>
        </div>
      </div>

      {/* DUAL WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: FEATURES FORM (3 cols) */}
        <div className="lg:col-span-3">
          
          {activeTab === 'diabetes' ? (
            /* DIABETES FORM CONTAINER */
            <GlassCard glowColor="cyan" title="Diabetes Risk Telemetry Form">
              <form onSubmit={handleSubmitDiabetes} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Age */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Age (Years)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      value={diabAge}
                      onChange={(e) => setDiabAge(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200"
                    />
                  </div>

                  {/* BMI */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">BMI (Body Mass Index)</label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      value={diabBmi}
                      onChange={(e) => setDiabBmi(parseFloat(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200"
                    />
                  </div>

                  {/* Systolic BP */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={diabSys}
                      onChange={(e) => setDiabSys(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200"
                    />
                  </div>

                  {/* Diastolic BP */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={diabDia}
                      onChange={(e) => setDiabDia(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200"
                    />
                  </div>

                  {/* HbA1c */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider flex items-center">
                      HbA1c Level (%)
                      <HelpCircle className="w-3.5 h-3.5 ml-1.5 text-slate-500" title="Normal: <5.7%, Prediabetes: 5.7-6.4%, Diabetes: >6.5%" />
                    </label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      value={diabHba1c}
                      onChange={(e) => setDiabHba1c(parseFloat(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200"
                    />
                  </div>

                  {/* Fasting Glucose */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider flex items-center">
                      Fasting Glucose (mg/dL)
                      <HelpCircle className="w-3.5 h-3.5 ml-1.5 text-slate-500" title="Fasting Glucose Normal: <100 mg/dL" />
                    </label>
                    <input
                      type="number"
                      required
                      value={diabGlucose}
                      onChange={(e) => setDiabGlucose(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200"
                    />
                  </div>

                  {/* Genetic Predisposed */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Genetic Predisposition</label>
                    <select
                      value={diabFamily}
                      onChange={(e) => setDiabFamily(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-300"
                    >
                      <option value="0">No Family History of Diabetes</option>
                      <option value="1">Yes, Family History Exists</option>
                    </select>
                  </div>

                  {/* Physical Activity */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Physical Activity (Hours/Week)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="168"
                      value={diabActivity}
                      onChange={(e) => setDiabActivity(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200"
                    />
                  </div>

                  {/* Smoking */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Tobacco Smoking History</label>
                    <select
                      value={diabSmoking}
                      onChange={(e) => setDiabSmoking(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-300"
                    >
                      <option value="0">Non-Smoker / Never smoked</option>
                      <option value="1">Active Smoker / Chronic History</option>
                    </select>
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2.5 py-4 bg-gradient-to-r from-neon-cyan to-neon-indigo hover:from-cyan-400 hover:to-indigo-500 text-cyber-darker font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-md shadow-neon-cyan/25 active:scale-95 disabled:opacity-50 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Processing Neural Models...</span>
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-4.5 h-4.5" />
                      <span>Compute Diabetes Risk Index</span>
                    </>
                  )}
                </button>
              </form>
            </GlassCard>
          ) : (
            /* HEART DISEASE FORM CONTAINER */
            <GlassCard glowColor="purple" title="Cardiovascular Telemetry Form">
              <form onSubmit={handleSubmitHeart} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Age */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Age (Years)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      value={heartAge}
                      onChange={(e) => setHeartAge(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200"
                    />
                  </div>

                  {/* Sex */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Biological Sex</label>
                    <select
                      value={heartSex}
                      onChange={(e) => setHeartSex(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-300"
                    >
                      <option value="1">Male</option>
                      <option value="0">Female</option>
                    </select>
                  </div>

                  {/* Chest Pain Type */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Chest Pain Discomfort Type</label>
                    <select
                      value={heartCp}
                      onChange={(e) => setHeartCp(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-300"
                    >
                      <option value="0">Asymptomatic (No Chest Discomfort)</option>
                      <option value="1">Atypical Angina (Non-Cardiovascular Discomfort)</option>
                      <option value="2">Non-Anginal Chest Pain (Mild tension)</option>
                      <option value="3">Typical Angina (Heavy tightness/pressure)</option>
                    </select>
                  </div>

                  {/* Resting BP */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Resting Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={heartBp}
                      onChange={(e) => setHeartBp(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200"
                    />
                  </div>

                  {/* Cholesterol */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Serum Cholesterol (mg/dL)</label>
                    <input
                      type="number"
                      required
                      value={heartChol}
                      onChange={(e) => setHeartChol(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200"
                    />
                  </div>

                  {/* Fasting Blood Sugar */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Fasting Blood Sugar &gt; 120 mg/dL</label>
                    <select
                      value={heartFbs}
                      onChange={(e) => setHeartFbs(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-300"
                    >
                      <option value="0">No (Fasting sugar normal)</option>
                      <option value="1">Yes (Elevated / Diabetic)</option>
                    </select>
                  </div>

                  {/* Resting ECG */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Resting Electrocardiogram (ECG)</label>
                    <select
                      value={heartEcg}
                      onChange={(e) => setHeartEcg(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-300"
                    >
                      <option value="0">Normal</option>
                      <option value="1">ST-T Wave Abnormality</option>
                      <option value="2">Left Ventricular Hypertrophy</option>
                    </select>
                  </div>

                  {/* Max Heart Rate */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Max Achieved Heart Rate (BPM)</label>
                    <input
                      type="number"
                      required
                      value={heartMaxHr}
                      onChange={(e) => setHeartMaxHr(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200"
                    />
                  </div>

                  {/* Exercise Angina */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Exercise Induced Angina Discomfort</label>
                    <select
                      value={heartAngina}
                      onChange={(e) => setHeartAngina(parseInt(e.target.value))}
                      className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-300"
                    >
                      <option value="0">No (Cardio workout is pain-free)</option>
                      <option value="1">Yes (Tightness experienced on active exertion)</option>
                    </select>
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2.5 py-4 bg-gradient-to-r from-neon-purple to-neon-indigo hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-md shadow-neon-purple/25 active:scale-95 disabled:opacity-50 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Cardiac Vectors...</span>
                    </>
                  ) : (
                    <>
                      <HeartPulse className="w-4.5 h-4.5 animate-pulse" />
                      <span>Compute Cardiovascular Risk Index</span>
                    </>
                  )}
                </button>
              </form>
            </GlassCard>
          )}

        </div>

        {/* RIGHT COLUMN: ANALYZED RESULTS FRAME (2 cols) */}
        <div className="lg:col-span-2">
          
          {report ? (
            /* GLOWING RISK REPORT CONTAINER */
            <GlassCard 
              glowColor={report.type === 'diabetes' ? 'cyan' : 'purple'} 
              title="Risk telemetry Readout"
              className="space-y-6"
            >
              
              {/* Dynamic Health Risk Percentage Meter */}
              <div className="flex flex-col items-center justify-center py-6 border-b border-slate-200/10 dark:border-slate-850/15 relative">
                
                {/* Circular glowing dashboard gauge */}
                <div className="relative w-36 h-36 rounded-full border-[6px] border-slate-800 bg-slate-950/60 flex flex-col items-center justify-center shadow-lg">
                  
                  {/* Arc coloring HSL tailored depending on risk score */}
                  <div 
                    className={`
                      absolute inset-0 rounded-full border-[6px] border-transparent transition-all duration-1000
                      ${report.score > 60 
                        ? 'border-t-neon-crimson border-r-neon-crimson' 
                        : report.score > 30 
                        ? 'border-t-amber-400 border-r-amber-400' 
                        : 'border-t-neon-emerald border-r-neon-emerald'
                      }
                    `}
                    style={{ transform: `rotate(${report.score * 3.6}deg)` }}
                  ></div>

                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Risk Level</span>
                  <span className="text-3xl font-black text-white font-cyber-title font-mono tracking-tighter mt-1">{report.score}%</span>
                </div>

                {/* Severity Badge */}
                <span className={`
                  font-bold font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border mt-6
                  ${report.score > 60 
                    ? 'bg-red-500/10 border-red-500/20 text-neon-crimson shadow-neon-crimson' 
                    : report.score > 30 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-sm' 
                    : 'bg-emerald-500/10 border-emerald-500/20 text-neon-emerald shadow-neon-emerald'
                  }
                `}>
                  {report.category}
                </span>
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-cyber-title">AI Personalized Recommendations</h4>
                <div className="p-3 bg-slate-950/40 border border-slate-200/5 rounded-xl space-y-2">
                  {report.suggestions.map((s, idx) => (
                    <p key={idx} className="text-xs text-slate-300 font-mono leading-relaxed flex items-start space-x-2">
                      <span className="text-neon-cyan font-bold flex-shrink-0">•</span>
                      <span>{s}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Sync ledger */}
              <button
                onClick={saveReport}
                disabled={saving || saveSuccess}
                className={`
                  w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl text-xs font-extrabold font-mono uppercase tracking-widest transition-all duration-300 border
                  ${saveSuccess
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-neon-emerald'
                    : report.type === 'diabetes'
                    ? 'bg-neon-cyan/15 hover:bg-neon-cyan hover:text-cyber-darker border-neon-cyan/25 text-neon-cyan'
                    : 'bg-neon-purple/15 hover:bg-neon-purple hover:text-cyber-darker border-neon-purple/25 text-neon-purple'
                  }
                `}
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Synchronizing ledger...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Record Pushed to Profile!</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Sync Report to Ledger</span>
                  </>
                )}
              </button>

            </GlassCard>
          ) : (
            /* PRE-LOG MOCKUP */
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-250/10 dark:border-slate-800/15 rounded-3xl p-12 text-center text-slate-500 font-mono space-y-4">
              <TrendingUp className="w-14 h-14 text-slate-600 animate-pulse-slow" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Readout offline</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed max-w-xs">
                  Fill in parameters inside the medical form and compute risk to load the neural network predictions.
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-[9px] text-neon-cyan uppercase bg-neon-cyan/5 border border-neon-cyan/10 px-2 py-1 rounded">
                <Sparkles className="w-3 h-3 animate-spin" />
                <span>scikit-learn active</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default PredictionReports;
