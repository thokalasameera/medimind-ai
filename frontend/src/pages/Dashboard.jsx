import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import WaterTracker from '../components/WaterTracker';
import SleepTracker from '../components/SleepTracker';
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  Sparkles, 
  Info, 
  FileText, 
  CheckCircle2, 
  Circle,
  AlertTriangle 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

const formatPatientValue = (value, unit) => {
  if (value === null || value === undefined || value === '') {
    return 'Not set';
  }
  return unit ? `${value} ${unit}` : `${value}`;
};

const generateMock7DayMetrics = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon
  
  const arrangedDays = [];
  for (let i = 6; i >= 0; i--) {
    const idx = (todayIndex - i + 7) % 7;
    arrangedDays.push(days[idx]);
  }
  
  return arrangedDays.map((day, index) => {
    const isToday = index === 6;
    return {
      id: `mock-metric-${index}`,
      date: day,
      waterIntake: isToday ? 250 : [2000, 2250, 2750, 3250, 1750, 2500][index % 6],
      sleepHours: isToday ? 6.5 : [7.0, 8.0, 7.5, 6.0, 8.5, 7.0][index % 6],
      sleepQuality: isToday ? 'Good' : ['Excellent', 'Good', 'Fair', 'Poor', 'Excellent', 'Good'][index % 6]
    };
  });
};

const Dashboard = ({ triggerEmergency }) => {
  const { user, token, refreshProfile } = useAuth();
  
  // States for dynamic biometrics
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [activeRecords, setActiveRecords] = useState([]);
  const [medsToday, setMedsToday] = useState([]);
  
  const [waterLogged, setWaterLogged] = useState(0);
  const [sleepLogged, setSleepLogged] = useState(0);
  const [sleepQuality, setSleepQuality] = useState('Good');
  
  const [dailyTip, setDailyTip] = useState('');

  // Daily tips repository
  const healthTips = [
    "Circadian rhythms align best when caffeine is avoided after 14:00 PM.",
    "A 10-minute walk after meals optimizes insulin response and assists prediction models.",
    "Hydration directly correlates with blood vessel flexibility and lowers heart risk metrics.",
    "7-9 hours of deep sleep removes neurotoxins and increases neural recovery indexes.",
    "Integrate cruciferous vegetables (broccoli, cabbage) to help stabilize daily glucose parameters."
  ];

  useEffect(() => {
    // Select random daily tip
    setDailyTip(healthTips[Math.floor(Math.random() * healthTips.length)]);

    const fetchDashboardData = async () => {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch metrics history (past 7 days)
      try {
        const resMetrics = await fetch(`${API_URL}/metrics/history`, { headers });
        if (!resMetrics.ok) throw new Error();
        const dataMetrics = await resMetrics.json();
        if (dataMetrics.success && dataMetrics.metrics.length > 0) {
          setMetricsHistory(dataMetrics.metrics);
          localStorage.setItem('medimind_metrics_history', JSON.stringify(dataMetrics.metrics));
          
          const todayMetric = dataMetrics.metrics[dataMetrics.metrics.length - 1];
          setWaterLogged(todayMetric.waterIntake);
          setSleepLogged(todayMetric.sleepHours);
          setSleepQuality(todayMetric.sleepQuality);
        } else {
          throw new Error();
        }
      } catch (err) {
        console.warn("Metrics history unavailable from server, checking local cache.");
        const localMetrics = localStorage.getItem('medimind_metrics_history');
        if (localMetrics) {
          const parsed = JSON.parse(localMetrics);
          setMetricsHistory(parsed);
          if (parsed.length > 0) {
            const todayMetric = parsed[parsed.length - 1];
            setWaterLogged(todayMetric.waterIntake);
            setSleepLogged(todayMetric.sleepHours);
            setSleepQuality(todayMetric.sleepQuality);
          }
        } else {
          const generated = generateMock7DayMetrics();
          setMetricsHistory(generated);
          localStorage.setItem('medimind_metrics_history', JSON.stringify(generated));
          const todayMetric = generated[generated.length - 1];
          setWaterLogged(todayMetric.waterIntake);
          setSleepLogged(todayMetric.sleepHours);
          setSleepQuality(todayMetric.sleepQuality);
        }
      }

      // 2. Fetch diagnostic records history
      try {
        const resRecords = await fetch(`${API_URL}/records`, { headers });
        if (!resRecords.ok) throw new Error();
        const dataRecords = await resRecords.json();
        if (dataRecords.success) {
          setActiveRecords(dataRecords.records.slice(0, 3));
          localStorage.setItem('medimind_records', JSON.stringify(dataRecords.records));
        } else {
          throw new Error();
        }
      } catch (err) {
        console.warn("Telemetry records unavailable from server, using local cache.");
        const localRecords = localStorage.getItem('medimind_records');
        if (localRecords) {
          setActiveRecords(JSON.parse(localRecords).slice(0, 3));
        }
      }

      // 3. Fetch daily medicine reminders
      try {
        const resMeds = await fetch(`${API_URL}/reminders`, { headers });
        if (!resMeds.ok) throw new Error();
        const dataMeds = await resMeds.json();
        if (dataMeds.success) {
          setMedsToday(dataMeds.reminders);
          localStorage.setItem('medimind_reminders', JSON.stringify(dataMeds.reminders));
        } else {
          throw new Error();
        }
      } catch (err) {
        console.warn("Medication reminders unavailable from server, using local cache.");
        const localMeds = localStorage.getItem('medimind_reminders');
        if (localMeds) {
          setMedsToday(JSON.parse(localMeds));
        }
      }
    };

    if (token) {
      refreshProfile().catch(() => {});
      fetchDashboardData();
    }
  }, [token]);

  // Medication taken toggle
  const toggleMedTaken = async (id) => {
    try {
      if (String(id).startsWith('mock-')) {
        throw new Error("Demo mode toggle");
      }
      const res = await fetch(`${API_URL}/reminders/complete/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        const updated = medsToday.map(m => m.id === id ? { ...m, completedToday: data.reminder.completedToday } : m);
        setMedsToday(updated);
        localStorage.setItem('medimind_reminders', JSON.stringify(updated));
      }
    } catch (err) {
      console.warn("Toggling medicine completion locally on dashboard.");
      const updated = medsToday.map(m => m.id === id ? { ...m, completedToday: !m.completedToday } : m);
      setMedsToday(updated);
      localStorage.setItem('medimind_reminders', JSON.stringify(updated));
    }
  };

  // Callback to sync local water log state with graph
  const handleWaterLogged = (val) => {
    setWaterLogged(val);
    setMetricsHistory(prev => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[copy.length - 1].waterIntake = val;
      }
      localStorage.setItem('medimind_metrics_history', JSON.stringify(copy));
      return copy;
    });
  };

  // Callback to sync local sleep hours state with graph
  const handleSleepLogged = (val, qual) => {
    setSleepLogged(val);
    setSleepQuality(qual);
    setMetricsHistory(prev => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[copy.length - 1].sleepHours = val;
        copy[copy.length - 1].sleepQuality = qual;
      }
      localStorage.setItem('medimind_metrics_history', JSON.stringify(copy));
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      
      {/* COCKPIT STATUS HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-black font-cyber-title text-white flex items-center">
            Patient Bio-Console <span className="text-neon-cyan font-mono text-xs ml-3 border border-neon-cyan/20 px-2 py-0.5 rounded bg-neon-cyan/5">ACTIVE</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Welcome back, Patient <span className="text-neon-cyan font-bold">{user?.name}</span> // System health score initialized.
          </p>
        </div>

        {/* Daily clinical tip ticker */}
        {dailyTip && (
          <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-200/10 rounded-xl px-4 py-2 text-xs max-w-sm">
            <Sparkles className="w-4.5 h-4.5 text-neon-cyan animate-pulse" />
            <span className="text-slate-400 italic font-mono">{dailyTip}</span>
          </div>
        )}
      </div>

      {/* DASHBOARD GRID CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACTIVE TRACKERS & BIO PROFILE */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TRACKERS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Water Tracker Widget */}
            <GlassCard glowColor="cyan" title="Water hydration">
              <WaterTracker 
                initialWater={waterLogged} 
                targetWater={user?.waterTarget || 3000} 
                onLogged={handleWaterLogged}
              />
            </GlassCard>

            {/* Sleep Tracker Widget */}
            <GlassCard glowColor="purple" title="Circadian Sleep">
              <SleepTracker 
                initialHours={sleepLogged}
                initialQuality={sleepQuality}
                targetHours={user?.sleepTarget || 8}
                onLogged={handleSleepLogged}
              />
            </GlassCard>

          </div>

          {/* DYNAMIC RECHARTS ANATOMICAL VITAL GRAPH */}
          <GlassCard glowColor="cyan" title="CIRCADIAN BIOMETRIC TELEMETRY (LAST 7 DAYS)">
            <div className="h-64 w-full text-xs font-mono text-slate-400">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metricsHistory}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" />
                  <YAxis stroke="rgba(255,255,255,0.3)" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15,23,42,0.9)', 
                      borderColor: '#22d3ee', 
                      borderRadius: '12px',
                      color: '#fff'
                    }} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    name="Water Intake (ml)" 
                    dataKey="waterIntake" 
                    stroke="#22d3ee" 
                    fillOpacity={1} 
                    fill="url(#colorWater)" 
                  />
                  <Area 
                    type="monotone" 
                    name="Sleep Hours (h)" 
                    dataKey="sleepHours" 
                    stroke="#a78bfa" 
                    fillOpacity={1} 
                    fill="url(#colorSleep)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

        </div>

        {/* RIGHT COLUMN: MEDICATION, PROFILE DIAL, AND DIAGNOSTIC REPORTS */}
        <div className="space-y-6">
          
          {/* SECURE BIOMETRICS SUMMARY */}
          <GlassCard glowColor="none" className="bg-gradient-to-tr from-slate-900 via-cyber-dark to-slate-950">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-cyber-title mb-4">Patient Parameters</h4>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-950/40 border border-slate-200/5 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Age</span>
                <span className="text-sm font-bold text-white">{formatPatientValue(user?.age, 'yrs')}</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-200/5 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Blood Type</span>
                <span className="text-sm font-bold text-neon-emerald">{formatPatientValue(user?.bloodType)}</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-200/5 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Weight</span>
                <span className="text-sm font-bold text-white">{formatPatientValue(user?.weight, 'kg')}</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-200/5 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Height</span>
                <span className="text-sm font-bold text-white">{formatPatientValue(user?.height, 'cm')}</span>
              </div>
            </div>
          </GlassCard>

          {/* MEDICINE SCHEDULER WIDGET */}
          <GlassCard glowColor="emerald" title="Medication scheduler">
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {medsToday.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-mono text-xs">
                  No active medicine alarms programmed today.
                </div>
              ) : (
                medsToday.map((med) => (
                  <div 
                    key={med.id}
                    onClick={() => toggleMedTaken(med.id)}
                    className={`
                      flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-300
                      ${med.completedToday 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-slate-950/40 border-slate-200/5 hover:border-neon-emerald/30 text-slate-300'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      {med.completedToday ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      )}
                      <div className="truncate">
                        <p className={`text-xs font-semibold truncate ${med.completedToday ? 'line-through text-slate-500' : ''}`}>
                          {med.medName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{med.dosage} // {med.frequency}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-200/5 px-2 py-0.5 rounded flex-shrink-0">{med.time}</span>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* DIAGNOSTIC RISK REPORTS WIDGET */}
          <GlassCard glowColor="purple" title="Diagnostic Telemetry">
            <div className="space-y-3">
              {activeRecords.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-mono text-xs">
                  No historical predictive tests logged.
                </div>
              ) : (
                activeRecords.map((rec) => (
                  <div 
                    key={rec.id}
                    className="p-3 bg-slate-950/40 border border-slate-200/5 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-neon-purple flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-white capitalize">{rec.type} Report</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {new Date(rec.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`
                        font-bold font-mono text-[11px] px-2 py-0.5 rounded block
                        ${rec.category.includes('High') 
                          ? 'bg-red-500/10 text-neon-crimson' 
                          : rec.category.includes('Moderate') 
                          ? 'bg-amber-500/10 text-amber-400' 
                          : 'bg-emerald-500/10 text-neon-emerald'
                        }
                      `}>
                        {rec.riskScore}%
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-slate-500 block mt-0.5">{rec.category}</span>
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

export default Dashboard;
