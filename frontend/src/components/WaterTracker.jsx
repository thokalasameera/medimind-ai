import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Droplet, Plus, RotateCcw, GlassWater } from 'lucide-react';

const WaterTracker = ({ initialWater = 0, targetWater = 3000, onLogged }) => {
  const [water, setWater] = useState(initialWater);
  const { token } = useAuth();
  
  useEffect(() => {
    setWater(initialWater);
  }, [initialWater]);

  // Sync to database
  const syncWater = async (newValue) => {
    try {
      const res = await fetch(`${API_URL}/metrics/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ waterIntake: newValue })
      });
      const data = await res.json();
      if (data.success && onLogged) {
        onLogged(newValue);
      }
    } catch (err) {
      console.error("Could not sync water log:", err);
    }
  };

  const addWater = (amount) => {
    const nextWater = Math.min(water + amount, 6000); // capped at 6L
    setWater(nextWater);
    syncWater(nextWater);
  };

  const resetWater = () => {
    setWater(0);
    syncWater(0);
  };

  const percentage = Math.min(Math.round((water / targetWater) * 100), 100);

  return (
    <div className="flex items-center space-x-6">
      {/* CYBERNETIC FLUID CONTAINER */}
      <div className="relative w-28 h-44 rounded-3xl bg-slate-900/60 border-2 border-neon-cyan/20 overflow-hidden flex items-end shadow-neon-cyan flex-shrink-0">
        
        {/* Animated Water Liquid Fill */}
        <div 
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cyan-600/80 to-neon-cyan/70 transition-all duration-1000 ease-out"
          style={{ height: `${percentage}%` }}
        >
          {/* Wave overlapping layers */}
          {percentage > 0 && (
            <>
              <div className="absolute left-1/2 bottom-full w-[200%] h-12 bg-neon-cyan/75 rounded-[42%] -translate-x-1/2 water-wave"></div>
              <div className="absolute left-1/2 bottom-full w-[210%] h-12 bg-cyan-400/40 rounded-[38%] -translate-x-1/2 water-wave-slow"></div>
            </>
          )}
        </div>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <Droplet className={`w-8 h-8 ${percentage > 50 ? 'text-cyber-dark animate-bounce' : 'text-neon-cyan animate-pulse'} mb-1`} />
          <span className={`text-xl font-black ${percentage > 50 ? 'text-cyber-dark' : 'text-white'} font-cyber-title`}>
            {percentage}%
          </span>
          <span className={`text-[10px] uppercase tracking-widest ${percentage > 50 ? 'text-cyber-dark/80' : 'text-slate-400'}`}>
            Hydrated
          </span>
        </div>
      </div>

      {/* INTERACTION LOG CONTROLS */}
      <div className="flex-1 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Hydration Progress</h4>
          <p className="text-xs text-slate-500 mt-1">
            Logged: <span className="text-neon-cyan font-bold font-mono">{water} ml</span> / {targetWater} ml
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => addWater(250)}
            className="flex items-center space-x-1 px-3 py-2 bg-neon-cyan/15 hover:bg-neon-cyan hover:text-cyber-dark text-neon-cyan font-semibold rounded-xl text-xs transition-all duration-300 border border-neon-cyan/25"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+250ml (Cup)</span>
          </button>
          <button
            onClick={() => addWater(500)}
            className="flex items-center space-x-1 px-3 py-2 bg-neon-cyan/15 hover:bg-neon-cyan hover:text-cyber-dark text-neon-cyan font-semibold rounded-xl text-xs transition-all duration-300 border border-neon-cyan/25"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+500ml (Bottle)</span>
          </button>
          <button
            onClick={resetWater}
            className="p-2 bg-slate-200/10 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-xl transition-all duration-300 border border-transparent"
            title="Reset Daily Intake"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-[10px] text-slate-400 leading-relaxed max-w-xs font-mono">
          ⚡ Quantum reminder: optimal biological hydration stabilizes your resting cardiovascular rate and fuels metabolic prediction.
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;
