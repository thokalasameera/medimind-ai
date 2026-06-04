import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Moon, Star, Plus, Minus, Info } from 'lucide-react';

const SleepTracker = ({ initialHours = 0, initialQuality = 'Good', targetHours = 8, onLogged }) => {
  const [hours, setHours] = useState(initialHours);
  const [quality, setQuality] = useState(initialQuality);
  const { token } = useAuth();

  useEffect(() => {
    setHours(initialHours);
    setQuality(initialQuality);
  }, [initialHours, initialQuality]);

  const syncSleep = async (newHours, newQuality) => {
    try {
      const res = await fetch(`${API_URL}/metrics/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          sleepHours: newHours, 
          sleepQuality: newQuality 
        })
      });
      const data = await res.json();
      if (data.success && onLogged) {
        onLogged(newHours, newQuality);
      }
    } catch (err) {
      console.error("Could not sync sleep metrics:", err);
    }
  };

  const adjustHours = (diff) => {
    const nextHours = Math.max(0, Math.min(hours + diff, 24));
    setHours(nextHours);
    syncSleep(nextHours, quality);
  };

  const changeQuality = (e) => {
    const nextQuality = e.target.value;
    setQuality(nextQuality);
    syncSleep(hours, nextQuality);
  };

  const percentage = Math.min(Math.round((hours / targetHours) * 100), 100);

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left w-full overflow-hidden">
      {/* RADIAL STARRY CONTAINER */}
      <div className="relative w-24 h-24 rounded-full border-4 border-slate-700 bg-slate-900/80 overflow-hidden flex flex-col items-center justify-center shadow-neon-purple flex-shrink-0">
        
        {/* Starry dots absolute mockup */}
        <span className="absolute top-3 left-5 text-white text-[5px] animate-pulse">✦</span>
        <span className="absolute top-10 left-16 text-white text-[3px] animate-ping">✦</span>
        <span className="absolute top-16 left-6 text-white text-[4px] animate-pulse">✦</span>

        {/* Dynamic Glowing border segment matching percentage */}
        <div 
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-neon-purple transition-all duration-1000"
          style={{ transform: `rotate(${percentage * 3.6}deg)` }}
        ></div>

        <Moon className="w-5.5 h-5.5 text-neon-purple mb-0.5 animate-float" />
        <span className="text-lg font-black text-white font-cyber-title font-mono">{hours}h</span>
        <span className="text-[8px] uppercase tracking-widest text-slate-400">Slept</span>
      </div>

      {/* DETAILED STATS AND LOGGING ADJUSTERS */}
      <div className="flex-1 space-y-3.5 w-full min-w-0">
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Rejuvenation Progress</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Goal: <span className="text-neon-purple font-bold font-mono">{targetHours} hrs</span> · Logged: {hours} hrs ({percentage}%)
          </p>
        </div>

        {/* Adjusting hours buttons and quality selector wrapped gracefully */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <div className="flex items-center bg-slate-250/10 dark:bg-slate-200/5 rounded-xl border border-slate-200/10 p-0.5">
            <button
              onClick={() => adjustHours(-0.5)}
              className="p-1.5 hover:bg-slate-200/20 text-slate-400 hover:text-white rounded-lg transition-all duration-300"
              title="Decrease by 30 mins"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-white font-mono">{hours}</span>
            <button
              onClick={() => adjustHours(0.5)}
              className="p-1.5 hover:bg-slate-200/20 text-slate-400 hover:text-white rounded-lg transition-all duration-300"
              title="Increase by 30 mins"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sleep Quality Selector */}
          <select
            value={quality}
            onChange={changeQuality}
            className="bg-slate-900/60 border border-slate-200/10 dark:border-slate-800/30 text-xs font-semibold rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-neon-purple/50"
          >
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>

        <div className="text-[10px] text-slate-400 leading-relaxed font-mono flex items-start justify-center sm:justify-start space-x-1.5 max-w-xs mx-auto sm:mx-0">
          <Info className="w-3.5 h-3.5 text-neon-purple flex-shrink-0 mt-0.5" />
          <span className="text-left">Circadian deep cycles down-regulate resting cardiovascular metrics.</span>
        </div>
      </div>
    </div>
  );
};

export default SleepTracker;
