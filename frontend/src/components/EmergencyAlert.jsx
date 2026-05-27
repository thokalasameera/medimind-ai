import React, { useState, useEffect } from 'react';
import { ShieldAlert, PhoneCall, X, Heart, HelpCircle, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

const EmergencyAlert = ({ isOpen, onClose }) => {
  const [dialing, setDialing] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval;
    if (dialing) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [dialing]);

  if (!isOpen) return null;

  const triggerMockCall = () => {
    setDialing(true);
  };

  const cancelCall = () => {
    setDialing(false);
  };

  return (
    <div className="fixed inset-0 bg-cyber-darker/95 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
      
      {/* RED FLASHING ALARM BACKGROUND HIGHLIGHT */}
      <div className="absolute inset-0 bg-red-600/10 animate-pulse pointer-events-none"></div>

      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-neon-crimson rounded-3xl shadow-neon-crimson p-6 overflow-hidden flex flex-col justify-between">
        
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-800/80 text-slate-400 hover:text-white rounded-full border border-slate-200/10 hover:border-slate-200/30 transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* DIALING MODAL OVERLAY */}
        {dialing ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-6 animate-pulse">
            <div className="w-24 h-24 rounded-full bg-red-600 border-4 border-white flex items-center justify-center shadow-lg animate-ping">
              <PhoneCall className="w-10 h-10 text-white" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider font-cyber-title animate-bounce">
                Dialing Medical Dispatch...
              </h2>
              <p className="text-neon-crimson font-bold font-mono text-sm tracking-widest">
                CONNECTING TO LOCAL EMERGENCY UNIT: 911 / 112
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Duration: <span className="text-white font-bold">{seconds}s</span> | Transmitting GPS telemetry...
              </p>
            </div>

            <button
              onClick={cancelCall}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md"
            >
              Abort Outgoing Connection
            </button>
          </div>
        ) : (
          /* STANDARD EMERGENCY DIALOGUE */
          <>
            {/* Header info */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-neon-crimson shadow-sm flex-shrink-0">
                <ShieldAlert className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white font-cyber-title uppercase tracking-wide">
                  MediMind Alert Portal
                </h2>
                <p className="text-xs text-neon-crimson font-bold uppercase tracking-widest mt-0.5">
                  Predictive Defense System Active
                </p>
              </div>
            </div>

            {/* Simulated protection console banner */}
            <div className="p-3 bg-red-950/20 border border-red-800/40 rounded-xl mb-6 flex items-start space-x-3">
              <UserCheck className="w-5 h-5 text-neon-crimson flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 font-mono">
                <span className="text-white font-bold">[TELEMETRY SENT]:</span> Medical health summary compiled and pushed to active emergency profile. Local responders have been alerted of your registered medical details.
              </div>
            </div>

            {/* Quick First-Aid protocol guide cards */}
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 font-cyber-title">
              Instant First-Aid Medical Protocol
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              
              {/* Card 1: Cardiac Protocol */}
              <div className="p-4 bg-slate-950/40 border border-slate-200/10 rounded-2xl flex items-start space-x-3">
                <Heart className="w-5 h-5 text-neon-crimson mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-cyber-title">Chest Pain / Cardiac</h4>
                  <ul className="text-[11px] text-slate-400 mt-1.5 space-y-1 font-mono leading-relaxed">
                    <li>• Sit in a semi-upright posture.</li>
                    <li>• Loosen tight clothing immediately.</li>
                    <li>• Chew aspirin if patient is conscious.</li>
                    <li>• Prepare for CPR if breathing stops.</li>
                  </ul>
                </div>
              </div>

              {/* Card 2: CPR rhythm guidelines */}
              <div className="p-4 bg-slate-950/40 border border-slate-200/10 rounded-2xl flex items-start space-x-3">
                <HelpCircle className="w-5 h-5 text-neon-cyan mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-cyber-title">CPR Rhythm Guide</h4>
                  <ul className="text-[11px] text-slate-400 mt-1.5 space-y-1 font-mono leading-relaxed">
                    <li>• 100 to 120 compressions/min.</li>
                    <li>• Match rhythmic beats of "Stayin' Alive".</li>
                    <li>• Push down 2 inches deep in center.</li>
                    <li>• Allow chest to recoil fully between reps.</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between border-t border-slate-200/10 pt-4 mt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-200/10 hover:bg-slate-200/20 text-slate-300 font-semibold rounded-xl text-xs uppercase transition-all duration-300"
              >
                Close Protective Portal
              </button>

              <button
                onClick={triggerMockCall}
                className="flex items-center space-x-2 py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-red-900/35 active:scale-95"
              >
                <PhoneCall className="w-4 h-4 animate-pulse" />
                <span>Simulate Call responders</span>
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default EmergencyAlert;
