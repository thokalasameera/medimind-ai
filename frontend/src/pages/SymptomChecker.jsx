import React, { useState } from 'react';
import { useAuth, API_URL, ML_API_URL } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import VoiceInput from '../components/VoiceInput';
import { 
  Stethoscope, 
  Activity, 
  ShieldAlert, 
  Volume2, 
  CheckSquare, 
  Square,
  Database,
  Loader,
  HeartCrack
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { localAnalyzeSymptoms } from '../utils/localPredictors';

const SymptomChecker = () => {
  const { token } = useAuth();
  
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');
  
  const [diagnosing, setDiagnosing] = useState(false);
  const [report, setReport] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const availableSymptoms = [
    "Headache",
    "Fever",
    "Cough",
    "Chest Pain",
    "Fatigue",
    "Shortness of Breath",
    "Nausea"
  ];

  const handleToggleSymptom = (symptom) => {
    const s = symptom.toLowerCase();
    if (selectedSymptoms.includes(s)) {
      setSelectedSymptoms(prev => prev.filter(x => x !== s));
    } else {
      setSelectedSymptoms(prev => [...prev, s]);
    }
  };

  const handleVoiceTranscript = (text) => {
    setCustomSymptom(text);
    
    // Check if voice matches any of our predefined symptoms and auto-check them!
    const textLower = text.toLowerCase();
    availableSymptoms.forEach(s => {
      const sLower = s.toLowerCase();
      if (textLower.includes(sLower) && !selectedSymptoms.includes(sLower)) {
        setSelectedSymptoms(prev => [...prev, sLower]);
      }
    });
  };

  const handleAddCustom = () => {
    if (customSymptom.trim()) {
      const items = customSymptom.toLowerCase().split(/,|and/).map(s => s.trim()).filter(Boolean);
      setSelectedSymptoms(prev => {
        const unique = new Set([...prev, ...items]);
        return Array.from(unique);
      });
      setCustomSymptom('');
    }
  };

  const runDiagnosis = async () => {
    if (selectedSymptoms.length === 0) {
      alert("Please select or speak at least one symptom parameter.");
      return;
    }

    setDiagnosing(true);
    setReport(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`${ML_API_URL}/analyze-symptoms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: selectedSymptoms })
      });
      if (!res.ok) throw new Error("Flask service returned non-OK status");
      const data = await res.json();
      
      if (data.success) {
        setReport(data);
        setIsDemoMode(false);
      } else {
        throw new Error(data.error || "Symptom check returned unsuccessful status");
      }
    } catch (err) {
      console.warn("Flask ML service offline, running local fallback symptom analyzer.", err);
      setIsDemoMode(true);
      const data = localAnalyzeSymptoms(selectedSymptoms);
      setReport(data);
    } finally {
      setDiagnosing(false);
    }
  };

  // Browser Speech Synthesis (Audio Output Readout)
  const speakResults = () => {
    if (!report) return;
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel(); // stop current readouts
      
      let text = `Symptom report analyzed. Your wellness index is ${report.health_score} percent. `;
      if (report.possible_conditions.length > 0) {
        text += `Primary condition matching is ${report.possible_conditions[0].condition} with ${report.possible_conditions[0].match_percentage} percent matching. `;
      }
      text += "Personalized clinical suggestions: " + report.recommendations.join(". ");

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      synth.speak(utterance);
    } else {
      alert("Your browser does not support Speech Synthesis audio outputs.");
    }
  };

  // Sync to database
  const saveReportToProfile = async () => {
    if (!report) return;
    setSaving(true);
    try {
      const inputData = { loggedSymptoms: selectedSymptoms };
      const riskScore = report.health_score; // wellness score
      const category = report.possible_conditions[0]?.condition || 'Undetermined Condition';
      const suggestions = report.recommendations;

      const res = await fetch(`${API_URL}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'symptom',
          inputData,
          riskScore,
          category,
          suggestions
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        // Play success confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22d3ee', '#34d399', '#a78bfa']
        });
      }
    } catch (err) {
      console.error(err);
      alert("Could not sync record with core server.");
    } finally {
      setSaving(false);
    }
  };

  const resetChecker = () => {
    setSelectedSymptoms([]);
    setCustomSymptom('');
    setReport(null);
    setSaveSuccess(false);
  };

  return (
    <div className="space-y-6">
      
      <div>
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-black font-cyber-title text-white">AI Symptom Diagnostic Checker</h2>
          {isDemoMode && (
            <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/25 text-amber-400 shadow-sm animate-pulse flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping mr-1"></span>
              <span>Demo Mode</span>
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Perform a quantum analysis over active physical symptoms using our lookup algorithms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: SELECTION AND INPUTS (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          <GlassCard glowColor="cyan" title="Symptom Parameters Selector">
            <div className="space-y-6">
              
              {/* Voice recognition sensor widget */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5 font-cyber-title">
                  Voice Recognition Sensor Input
                </label>
                <VoiceInput 
                  onTranscript={handleVoiceTranscript}
                  placeholder="Tell me what you are feeling... e.g. 'I have a mild headache and chest pain'"
                />
              </div>

              {/* Text area backup */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  placeholder="Or type custom symptoms here (separated by commas)..."
                  className="flex-1 bg-slate-950/60 border border-slate-200/10 dark:border-slate-800/30 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="px-4 py-3 bg-slate-200/10 hover:bg-slate-200/20 text-white rounded-xl text-xs font-semibold font-mono transition-all border border-slate-200/10"
                >
                  Add
                </button>
              </div>

              {/* Holographic Checkbox grid */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 font-cyber-title">
                  Quick-Log Active Parameters
                </label>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSymptoms.map((symptom) => {
                    const isChecked = selectedSymptoms.includes(symptom.toLowerCase());
                    return (
                      <div 
                        key={symptom}
                        onClick={() => handleToggleSymptom(symptom)}
                        className={`
                          flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 font-mono text-xs
                          ${isChecked 
                            ? 'bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan shadow-neon-cyan' 
                            : 'bg-slate-950/40 border-slate-200/5 hover:border-neon-cyan/20 text-slate-400 hover:text-slate-200'
                          }
                        `}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="font-semibold">{symptom}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active logging chips */}
              {selectedSymptoms.length > 0 && (
                <div className="pt-2 border-t border-slate-200/5 dark:border-slate-850/15">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 font-mono">Active Telemetry:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((s) => (
                      <span 
                        key={s}
                        onClick={() => handleToggleSymptom(s)}
                        className="px-2.5 py-1 bg-neon-cyan/5 hover:bg-red-500/10 text-neon-cyan hover:text-neon-crimson border border-neon-cyan/10 hover:border-neon-crimson/30 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all uppercase tracking-wider"
                      >
                        {s} ×
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* DIAGNOSE ACTION BUTTONS */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/10 mt-2">
                <button
                  onClick={resetChecker}
                  className="px-5 py-2.5 bg-slate-200/5 hover:bg-slate-200/10 text-slate-400 hover:text-white rounded-xl text-xs font-semibold font-mono border border-slate-200/10 transition-colors"
                >
                  Clear Console
                </button>

                <button
                  onClick={runDiagnosis}
                  disabled={diagnosing}
                  className="flex items-center space-x-2 py-3 px-6 bg-gradient-to-r from-neon-cyan to-neon-indigo hover:from-cyan-400 hover:to-indigo-500 text-cyber-darker font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-md shadow-neon-cyan/15 active:scale-95 disabled:opacity-50"
                >
                  {diagnosing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Diagnosing...</span>
                    </>
                  ) : (
                    <>
                      <Stethoscope className="w-4 h-4" />
                      <span>Diagnose Symptoms</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </GlassCard>

        </div>

        {/* RIGHT COLUMN: REVIEWS AND REPORT MATRIX (2 cols) */}
        <div className="lg:col-span-2">
          
          {report ? (
            <GlassCard glowColor="emerald" title="Clinical Bio-Readout" className="space-y-6">
              
              {/* Radial health score gauge */}
              <div className="flex items-center space-x-5 bg-slate-950/40 p-4 border border-slate-200/5 rounded-2xl">
                <div className="relative w-20 h-20 rounded-full border-4 border-slate-700 bg-slate-900/60 flex flex-col items-center justify-center flex-shrink-0">
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-neon-emerald transition-all duration-1000"
                    style={{ transform: `rotate(${report.health_score * 3.6}deg)` }}
                  ></div>
                  <Activity className="w-5 h-5 text-neon-emerald mb-0.5 animate-pulse" />
                  <span className="text-lg font-black text-white font-cyber-title font-mono">{report.health_score}%</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-cyber-title">Overall Wellness Score</h4>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono leading-relaxed">
                    Based on logged parameters, your clinical wellness index is generated. Lower scores indicate severe respiratory or cardiac strain.
                  </p>
                </div>
              </div>

              {/* Conditions List */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-cyber-title">Possible Conditions</h4>
                {report.possible_conditions.map((c) => {
                  const isCritical = c.severity.includes("CRITICAL") || c.severity.includes("Severe");
                  return (
                    <div 
                      key={c.condition}
                      className={`
                        p-3 bg-slate-950/40 border rounded-xl flex items-center justify-between
                        ${isCritical ? 'border-red-500/30' : 'border-slate-200/5'}
                      `}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        {isCritical ? (
                          <HeartCrack className="w-5 h-5 text-neon-crimson flex-shrink-0 animate-bounce" />
                        ) : (
                          <Activity className="w-5 h-5 text-neon-cyan flex-shrink-0" />
                        )}
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white truncate">{c.condition}</p>
                          <p className={`text-[9px] font-mono font-extrabold uppercase mt-0.5 ${isCritical ? 'text-neon-crimson' : 'text-slate-500'}`}>
                            Severity: {c.severity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className={`font-bold font-mono text-xs ${isCritical ? 'text-neon-crimson' : 'text-neon-cyan'}`}>
                          {c.match_percentage}%
                        </span>
                        <span className="text-[8px] uppercase tracking-widest text-slate-500 block mt-0.5">Match</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Advice */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-cyber-title">Clinical Guidelines</h4>
                <div className="p-3 bg-slate-950/40 border border-slate-200/5 rounded-xl space-y-2">
                  {report.recommendations.map((rec, idx) => (
                    <p key={idx} className="text-xs text-slate-300 font-mono leading-relaxed">
                      {rec}
                    </p>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Speak results + sync to profile */}
              <div className="flex gap-3 pt-4 border-t border-slate-200/10">
                <button
                  onClick={speakResults}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-3 bg-slate-200/5 hover:bg-slate-200/10 text-white font-semibold rounded-xl text-xs font-mono border border-slate-200/10 transition-colors"
                  title="Synthesize Bio-readout Aloud"
                >
                  <Volume2 className="w-4 h-4 text-neon-cyan animate-pulse" />
                  <span>Audio Readout</span>
                </button>

                <button
                  onClick={saveReportToProfile}
                  disabled={saving || saveSuccess}
                  className={`
                    flex-1 flex items-center justify-center space-x-1.5 py-3 rounded-xl text-xs font-bold font-mono transition-all duration-300 border
                    ${saveSuccess 
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-neon-emerald' 
                      : 'bg-neon-emerald/15 hover:bg-neon-emerald hover:text-cyber-darker border-neon-emerald/25 text-neon-emerald'
                    }
                  `}
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Indexing...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Database className="w-4 h-4" />
                      <span>Synchronized!</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      <span>Sync to profile</span>
                    </>
                  )}
                </button>
              </div>

            </GlassCard>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-250/10 dark:border-slate-800/15 rounded-3xl p-12 text-center text-slate-500 font-mono space-y-4">
              <Stethoscope className="w-14 h-14 text-slate-600 animate-pulse-slow" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Telemetry Pending</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed max-w-xs">
                  Fill in symptom parameters and press 'Diagnose Symptoms' to boot up AI ML lookup algorithms.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default SymptomChecker;
