import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { 
  User, 
  Target, 
  Save, 
  Loader,
  Heart,
  Droplet,
  Moon,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || 30);
  const [gender, setGender] = useState(user?.gender || 'Not Specified');
  const [bloodType, setBloodType] = useState(user?.bloodType || 'O+');
  const [weight, setWeight] = useState(user?.weight || 70.0);
  const [height, setHeight] = useState(user?.height || 170.0);
  
  const [waterTarget, setWaterTarget] = useState(user?.waterTarget || 3000);
  const [sleepTarget, setSleepTarget] = useState(user?.sleepTarget || 8.0);

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Keep local state in sync when the user context loads/updates asynchronously!
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAge(user.age || 30);
      setGender(user.gender || 'Not Specified');
      setBloodType(user.bloodType || 'O+');
      setWeight(user.weight || 70.0);
      setHeight(user.height || 170.0);
      setWaterTarget(user.waterTarget || 3000);
      setSleepTarget(user.sleepTarget || 8.0);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    setError('');

    try {
      const res = await updateProfile({
        name,
        age: parseInt(age),
        gender,
        bloodType,
        weight: parseFloat(weight),
        height: parseFloat(height),
        waterTarget: parseFloat(waterTarget),
        sleepTarget: parseFloat(sleepTarget)
      });

      if (res.success) {
        setMsg("Bio-profile database synchronized successfully.");
        // Play success confetti!
        confetti({
          particleCount: 60,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#22d3ee', '#34d399', '#a78bfa']
        });
      } else {
        setError(res.error || "Profile synchronization failed.");
      }
    } catch (err) {
      setError("Failed to reach profile synchronization node.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-black font-cyber-title text-white">Quantum Bio-Profile Settings</h2>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Synchronize your physiological indices and daily targets with our local database nodes.
        </p>
      </div>

      {/* FORM BODY GRID */}
      <div className="max-w-4xl mx-auto">
        <GlassCard glowColor="cyan" title="Biological Identity Ledger">
          <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
            
            {/* GLOWING NOTIFICATIONS */}
            {msg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-neon-emerald rounded-xl font-bold font-mono">
                ⚡ {msg}
              </div>
            )}
            {error && (
              <div className="p-3 bg-neon-crimson/10 border border-neon-crimson/25 text-neon-crimson rounded-xl font-bold font-mono">
                ⚠️ {error}
              </div>
            )}

            {/* BLOCK 1: PHYSIOLOGICAL METRICS */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-neon-cyan uppercase tracking-widest font-cyber-title flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                Physiological Parameters
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200"
                  />
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Age (Years)</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Biological Sex</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-300 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Not Specified">Not Specified</option>
                  </select>
                </div>

                {/* Blood Type */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Blood Type</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-300 focus:outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200"
                  />
                </div>

                {/* Height */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-200/10 dark:border-slate-800/15" />

            {/* BLOCK 2: QUANTUM DAILY GOALS */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-neon-purple uppercase tracking-widest font-cyber-title flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Target Metric Bounds
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Water Goal */}
                <div className="space-y-1.5 p-4 bg-slate-950/40 border border-slate-200/5 rounded-2xl flex items-center space-x-4">
                  <Droplet className="w-8 h-8 text-neon-cyan flex-shrink-0 animate-pulse" />
                  <div className="flex-1">
                    <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Hydration Goal (ml)</label>
                    <input
                      type="number"
                      required
                      step="50"
                      value={waterTarget}
                      onChange={(e) => setWaterTarget(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-200/5 rounded-xl px-3 py-2 text-slate-200 mt-1"
                    />
                  </div>
                </div>

                {/* Sleep Goal */}
                <div className="space-y-1.5 p-4 bg-slate-950/40 border border-slate-200/5 rounded-2xl flex items-center space-x-4">
                  <Moon className="w-8 h-8 text-neon-purple flex-shrink-0 animate-float" />
                  <div className="flex-1">
                    <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Circadian Sleep Goal (Hours)</label>
                    <input
                      type="number"
                      required
                      step="0.5"
                      value={sleepTarget}
                      onChange={(e) => setSleepTarget(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-200/5 rounded-xl px-3 py-2 text-slate-200 mt-1"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="flex items-center justify-between border-t border-slate-200/10 pt-4 mt-2">
              <div className="flex items-center text-[10px] text-slate-500 max-w-sm">
                <Info className="w-4 h-4 text-neon-cyan flex-shrink-0 mr-1.5" />
                <span>Adjusting bounds directly shifts dynamic radial dashboard thresholds.</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 py-3.5 px-8 bg-gradient-to-r from-neon-cyan to-neon-indigo hover:from-cyan-400 hover:to-indigo-500 text-cyber-darker font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-md shadow-neon-cyan/25 active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Synchronize Profile</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </GlassCard>
      </div>

    </div>
  );
};

export default ProfileSettings;
