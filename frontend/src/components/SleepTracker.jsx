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
    <div className="flex items-center space-x-6">
      {/* RADIAL STARRY CONTAINER */}
      <div className="relative w-28 h-28 rounded-full border-4 border-slate-700 bg-slate-900/80 overflow-hidden flex flex-col items-center justify-center shadow-neon-purple flex-shrink-0">
        
        {/* Starry dots absolute mockup */}
        <span className="absolute top-4 left-6 text-white text-[6px] animate-pulse">✦</span>
        <span className="absolute top-12 left-20 text-white text-[4px] animate-ping">✦</span>
        <span className="absolute top-20 left-8 text-white text-[5px] animate-pulse">✦</span>

        {/* Dynamic Glowing border segment matching percentage */}
        <div 
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-neon-purple transition-all duration-1000"
          style={{ transform: `rotate(${percentage * 3.6}deg)` }}
        ></div>

        <Moon className="w-7 h-7 text-neon-purple mb-1 animate-float" />
        <span className="text-xl font-black text-white font-cyber-title font-mono">{hours}h</span>
        <span className="text-[9px] uppercase tracking-widest text-slate-400">Sleep</span>
      </div>

      {/* DETAILED STATS AND LOGGING ADJUSTERS */}
      <div className="flex-1 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Rejuvenation Progress</h4>
          <p className="text-xs text-slate-500 mt-1">
            Logged: <span className="text-neon-purple font-bold font-mono">{hours} hrs</span> / {targetHours} hrs ({percentage}% efficiency)
          </p>
        </div>

        {/* Adjusting hours buttons */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-200/10 rounded-xl border border-slate-200/10 p-1">
            <button
              onClick={() => adjustHours(-0.5)}
              className="p-1.5 hover:bg-slate-200/20 text-slate-400 hover:text-white rounded-lg transition-all duration-300"
              title="Decrease by 30 mins"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-xs font-bold text-white font-mono">{hours}</span>
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
            className="bg-slate-900/60 border border-slate-200/10 dark:border-slate-800/30 text-xs font-semibold rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-neon-purple/50"
          >
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>

        <div className="text-[10px] text-slate-400 leading-relaxed font-mono flex items-start space-x-1.5">
          <Info className="w-3.5 h-3.5 text-neon-purple flex-shrink-0 mt-0.5" />
          <span>Resting heart rates automatically down-regulate during 'Excellent' circadian deep cycles.</span>
        </div>
      </div>
    </div>
  );
};

export default SleepTracker;
