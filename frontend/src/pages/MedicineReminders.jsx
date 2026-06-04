import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle,
  ToggleLeft,
  ToggleRight,
  BellRing,
  VolumeX,
  Volume2,
  Loader
} from 'lucide-react';
import confetti from 'canvas-confetti';

const MedicineReminders = () => {
  const { token } = useAuth();
  
  const [reminders, setReminders] = useState([]);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('1 tablet');
  const [frequency, setFrequency] = useState('Once daily');
  const [time, setTime] = useState('08:00');
  
  const [submitting, setSubmitting] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [muteAlarm, setMuteAlarm] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const playConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 30,
      origin: { y: 0.8 },
      colors: ['#34d399', '#22d3ee']
    });
  };

  // Fetch reminders on mount
  const fetchReminders = async () => {
    try {
      const res = await fetch(`${API_URL}/reminders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Backend offline");
      const data = await res.json();
      if (data.success) {
        setReminders(data.reminders);
        localStorage.setItem('medimind_reminders', JSON.stringify(data.reminders));
        setIsDemoMode(false);
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn("Express backend offline, loading reminders from localStorage.");
      setIsDemoMode(true);
      const local = localStorage.getItem('medimind_reminders');
      if (local) {
        setReminders(JSON.parse(local));
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchReminders();
    } else {
      setIsDemoMode(true);
      const local = localStorage.getItem('medimind_reminders');
      if (local) {
        setReminders(JSON.parse(local));
      }
    }
  }, [token]);

  // Alarm Clock Tick Effect
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      // Format HH:MM
      const currentHrs = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHrs}:${currentMins}`;
      
      // Look for any active reminder matching the current minute that hasn't been completed today!
      const matchingReminder = reminders.find(r => 
        r.isActive && 
        r.time === timeStr && 
        !r.completedToday
      );

      if (matchingReminder && (!activeAlarm || activeAlarm.id !== matchingReminder.id)) {
        setActiveAlarm(matchingReminder);
        
        // Play futuristic synthesized alarm sound using HTML5 Web Audio API
        if (!muteAlarm) {
          playSynthesisBeep();
        }
      }
    }, 10000); // scan every 10 seconds

    return () => clearInterval(clockInterval);
  }, [reminders, activeAlarm, muteAlarm]);

  // Sythesize standard clinical warning tone (Web Audio API)
  const playSynthesisBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx) {
        // Continuous triple beep sequence
        const playBeep = (timeOffset) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, audioCtx.currentTime + timeOffset); // High pitch sound
          
          gain.gain.setValueAtTime(0.12, audioCtx.currentTime + timeOffset);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + timeOffset + 0.15);
          
          osc.start(audioCtx.currentTime + timeOffset);
          osc.stop(audioCtx.currentTime + timeOffset + 0.18);
        };

        playBeep(0);
        playBeep(0.25);
        playBeep(0.5);
      }
    } catch (e) {
      console.warn("Audio Context is blocked or not supported on this browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medName || !time) return;
    
    setSubmitting(true);
    try {
      if (isDemoMode) {
        throw new Error("Demo mode active");
      }
      const res = await fetch(`${API_URL}/reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ medName, dosage, frequency, time })
      });
      if (!res.ok) throw new Error("Backend connection failed");
      const data = await res.json();
      if (data.success) {
        const updated = [...reminders, data.reminder].sort((a,b) => a.time.localeCompare(b.time));
        setReminders(updated);
        localStorage.setItem('medimind_reminders', JSON.stringify(updated));
        setMedName('');
        setDosage('1 tablet');
        setFrequency('Once daily');
        setTime('08:00');
        playConfetti();
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn("Express backend offline, storing reminder in localStorage.", err);
      setIsDemoMode(true);
      const mockReminder = {
        id: 'mock-' + Date.now(),
        medName,
        dosage,
        frequency,
        time,
        isActive: true,
        completedToday: false
      };
      const updated = [...reminders, mockReminder].sort((a,b) => a.time.localeCompare(b.time));
      setReminders(updated);
      localStorage.setItem('medimind_reminders', JSON.stringify(updated));
      
      setMedName('');
      setDosage('1 tablet');
      setFrequency('Once daily');
      setTime('08:00');
      playConfetti();
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      if (isDemoMode || String(id).startsWith('mock-')) {
        throw new Error("Local fallback mode");
      }
      const res = await fetch(`${API_URL}/reminders/toggle/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        const updated = reminders.map(r => r.id === id ? { ...r, isActive: data.reminder.isActive } : r);
        setReminders(updated);
        localStorage.setItem('medimind_reminders', JSON.stringify(updated));
      }
    } catch (err) {
      console.warn("Toggling reminder locally.", err);
      const updated = reminders.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
      setReminders(updated);
      localStorage.setItem('medimind_reminders', JSON.stringify(updated));
    }
  };

  const handleComplete = async (id) => {
    try {
      if (isDemoMode || String(id).startsWith('mock-')) {
        throw new Error("Local fallback mode");
      }
      const res = await fetch(`${API_URL}/reminders/complete/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        const updated = reminders.map(r => r.id === id ? { ...r, completedToday: data.reminder.completedToday } : r);
        setReminders(updated);
        localStorage.setItem('medimind_reminders', JSON.stringify(updated));
        if (activeAlarm && activeAlarm.id === id) {
          setActiveAlarm(null);
        }
      }
    } catch (err) {
      console.warn("Completing reminder locally.", err);
      const updated = reminders.map(r => r.id === id ? { ...r, completedToday: !r.completedToday } : r);
      setReminders(updated);
      localStorage.setItem('medimind_reminders', JSON.stringify(updated));
      if (activeAlarm && activeAlarm.id === id) {
        setActiveAlarm(null);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      if (isDemoMode || String(id).startsWith('mock-')) {
        throw new Error("Local fallback mode");
      }
      const res = await fetch(`${API_URL}/reminders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        const updated = reminders.filter(r => r.id !== id);
        setReminders(updated);
        localStorage.setItem('medimind_reminders', JSON.stringify(updated));
        if (activeAlarm && activeAlarm.id === id) {
          setActiveAlarm(null);
        }
      }
    } catch (err) {
      console.warn("Deleting reminder locally.", err);
      const updated = reminders.filter(r => r.id !== id);
      setReminders(updated);
      localStorage.setItem('medimind_reminders', JSON.stringify(updated));
      if (activeAlarm && activeAlarm.id === id) {
        setActiveAlarm(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black font-cyber-title text-white">Quantum Medicine reminders</h2>
            {isDemoMode && (
              <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/25 text-amber-400 shadow-sm animate-pulse flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping mr-1"></span>
                <span>Demo Mode</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Program daily medication schedules. The console scanner rings synthetic alarms during intake slots.
          </p>
        </div>

        {/* MUTE ALARM TOGGLE */}
        <button
          onClick={() => setMuteAlarm(!muteAlarm)}
          className={`
            flex items-center space-x-2 px-4 py-2 bg-slate-900/60 border rounded-xl text-xs font-semibold font-mono transition-colors
            ${muteAlarm 
              ? 'border-red-500/30 text-neon-crimson' 
              : 'border-slate-200/10 hover:border-slate-250/20 text-slate-400 hover:text-white'
            }
          `}
        >
          {muteAlarm ? (
            <>
              <VolumeX className="w-4 h-4 animate-pulse" />
              <span>Alarm Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>Audio Active</span>
            </>
          )}
        </button>
      </div>

      {/* ACTIVE REAL-TIME ALARM GRAPHIC */}
      {activeAlarm && (
        <div className="p-5 bg-gradient-to-r from-red-600/30 via-neon-crimson/15 to-transparent border-2 border-neon-crimson rounded-3xl animate-bounce shadow-neon-crimson flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600 border border-white flex items-center justify-center text-white shadow-lg animate-ping flex-shrink-0">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-md font-bold font-cyber-title text-white uppercase">Medicine Intake Alert!</h3>
              <p className="text-xs text-neon-crimson font-bold font-mono tracking-wider mt-0.5">
                Dose time: <span className="text-white">{activeAlarm.time}</span> | Name: <span className="text-white underline">{activeAlarm.medName}</span> ({activeAlarm.dosage})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleComplete(activeAlarm.id)}
              className="px-5 py-2.5 bg-neon-emerald hover:bg-emerald-500 text-cyber-dark font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all duration-300"
            >
              Log taken
            </button>
            <button
              onClick={() => setActiveAlarm(null)}
              className="px-4 py-2.5 bg-slate-200/10 hover:bg-slate-200/20 text-slate-300 rounded-xl text-xs font-mono transition-colors"
            >
              Snooze
            </button>
          </div>
        </div>
      )}

      {/* LAYOUT BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: REMINDER FORM (2 cols) */}
        <div className="lg:col-span-2">
          <GlassCard glowColor="cyan" title="Schedule Medicine Intake">
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              
              {/* Medicine Name */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider">Medicine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin / Aspirin"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 text-xs"
                />
              </div>

              {/* Dosage */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider">Dosage Amount</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1 pill / 2 drops / 5ml"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 text-xs"
                />
              </div>

              {/* Intake Time */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider">Schedule Time (HH:MM)</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-neon-cyan/50 text-xs"
                />
              </div>

              {/* Frequency */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider">Intake Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-200/5 rounded-xl px-4 py-3 text-slate-300 focus:outline-none"
                >
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Four times daily">Four times daily</option>
                  <option value="As needed">As needed (PRN)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r from-neon-cyan to-neon-indigo hover:from-cyan-400 hover:to-indigo-500 text-cyber-darker font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-md shadow-neon-cyan/15 active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Program reminder</span>
                  </>
                )}
              </button>

            </form>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: LIST SCHEDULER (3 cols) */}
        <div className="lg:col-span-3">
          <GlassCard glowColor="emerald" title="Active Medical Schedules Ticker">
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {reminders.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">
                  No medical reminders recorded on this terminal profile.
                </div>
              ) : (
                reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className={`
                      p-4 bg-slate-950/40 border rounded-2xl flex items-center justify-between text-xs transition-all duration-300
                      ${rem.completedToday 
                        ? 'border-emerald-500/25 bg-emerald-500/5' 
                        : rem.isActive 
                        ? 'border-slate-200/5' 
                        : 'border-slate-800/10 opacity-55'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-4 overflow-hidden">
                      {/* Taken toggle */}
                      <button
                        onClick={() => handleComplete(rem.id)}
                        className={`p-1 rounded-full transition-colors flex-shrink-0`}
                        title={rem.completedToday ? "Mark not taken" : "Mark as taken today"}
                      >
                        {rem.completedToday ? (
                          <CheckCircle2 className="w-6 h-6 text-neon-emerald" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-500 hover:text-neon-emerald" />
                        )}
                      </button>

                      {/* Info */}
                      <div className="truncate font-mono">
                        <p className={`font-bold text-white truncate ${rem.completedToday ? 'line-through text-slate-500' : ''}`}>
                          {rem.medName}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                          {rem.dosage} // {rem.frequency}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 flex-shrink-0">
                      {/* Time dial */}
                      <span className="text-[10px] font-mono font-bold bg-slate-200/5 px-2.5 py-1 border border-slate-200/10 rounded-xl text-white">
                        {rem.time}
                      </span>

                      {/* Active toggle switch */}
                      <button
                        onClick={() => handleToggle(rem.id)}
                        className={`text-slate-400 hover:text-white transition-colors`}
                        title={rem.isActive ? "Deactivate schedule" : "Activate schedule"}
                      >
                        {rem.isActive ? (
                          <ToggleRight className="w-7 h-7 text-neon-cyan" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-slate-600" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(rem.id)}
                        className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-xl transition-all"
                        title="Remove Alarm Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default MedicineReminders;
