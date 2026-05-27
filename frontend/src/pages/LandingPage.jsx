import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Heart, Cpu, BrainCircuit, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cyber-dark bg-grid-cyber flex flex-col justify-between relative overflow-hidden text-slate-100 transition-colors duration-300">
      
      {/* GLOWING AMBIENT BACKGROUND GRADIENT DUSTS */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-cyan/15 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[60%] bg-neon-indigo/10 rounded-full filter blur-[140px] pointer-events-none"></div>

      {/* TOP NAVBAR HEADER */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-glow to-neon-indigo flex items-center justify-center shadow-neon-cyan animate-pulse-slow">
            <Activity className="w-6 h-6 text-cyber-dark dark:text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-wider font-cyber-title text-white">
            MediMind <span className="text-neon-cyan font-black">AI</span>
          </h1>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2.5 bg-slate-200/10 hover:bg-slate-200/20 text-white font-semibold rounded-xl text-sm transition-all duration-300 border border-slate-200/10 hover:border-slate-200/25 shadow-sm hover:shadow-neon-cyan active:scale-95"
        >
          Initialize Console
        </button>
      </header>

      {/* MAIN HERO ACTION CONTAINER */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between flex-1 z-10">
        
        {/* HERO TYPOGRAPHY INFO */}
        <div className="flex-1 space-y-6 text-center md:text-left md:pr-12 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full text-neon-cyan text-xs font-bold uppercase tracking-widest animate-pulse">
            <Cpu className="w-4.5 h-4.5" />
            <span>Quantum ML Healthcare Platform</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black font-cyber-title text-white leading-tight">
            Predict. Prevent.<br />
            <span className="text-gradient-cyan font-black">Protect.</span>
          </h2>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-4">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center space-x-2 py-4 px-8 bg-gradient-to-r from-neon-cyan to-neon-indigo hover:from-cyan-400 hover:to-indigo-500 text-cyber-darker font-bold rounded-xl text-sm uppercase tracking-wider transition-all duration-300 shadow-lg shadow-neon-cyan/25 active:scale-95 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('features-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-4 px-8 bg-slate-200/5 hover:bg-slate-200/10 text-white font-semibold rounded-xl text-sm uppercase tracking-wider transition-all duration-300 border border-slate-200/10 hover:border-slate-200/20"
            >
              Explore Telemetry
            </button>
          </div>
        </div>

        {/* HERO PREMIUM DECORATIVE PANEL GRAPHIC */}
        <div className="flex-1 mt-12 md:mt-0 flex justify-center relative w-full max-w-md md:max-w-none">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 glow-border-cyan animate-float shadow-neon-cyan/20">
            {/* Header console decorations */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/10 mb-4">
              <span className="text-[10px] font-mono text-neon-cyan tracking-widest font-bold">SYSTEM_MONITOR_ACTIVE</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            {/* Inner Graphic Elements */}
            <div className="space-y-4 font-mono">
              <div className="flex justify-between text-xs text-slate-400">
                <span>VITAL_TELEMETRY:</span>
                <span className="text-neon-emerald font-bold">STABLE</span>
              </div>
              
              {/* Radial wave graphics mockup */}
              <div className="h-32 bg-slate-950/60 rounded-2xl flex items-center justify-center border border-slate-200/10 relative overflow-hidden">
                {/* Horizontal lines */}
                <div className="absolute inset-0 bg-grid-cyber opacity-20"></div>
                <div className="w-[120%] h-[2px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-pulse absolute"></div>
                <div className="w-[100%] h-[1px] bg-gradient-to-r from-transparent via-neon-emerald to-transparent transform translate-y-6 absolute"></div>
                <BrainCircuit className="w-16 h-16 text-neon-cyan/40 relative animate-pulse-slow" />
              </div>

              {/* Progress status indicators */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-200/10">
                  <span className="text-[9px] text-slate-500 block uppercase font-cyber-title">Diabetes Risk</span>
                  <span className="text-sm font-bold text-neon-cyan font-mono">14.2% [Low]</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-200/10">
                  <span className="text-[9px] text-slate-500 block uppercase font-cyber-title">Heart Risk</span>
                  <span className="text-sm font-bold text-neon-purple font-mono">22.8% [Low]</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* THREE KEY CORE PILLARS SECTION */}
      <section id="features-section" className="w-full max-w-7xl mx-auto px-6 py-16 z-10">
        <h3 className="text-center text-xs font-bold text-neon-cyan uppercase tracking-widest mb-12 font-cyber-title">
          MediMind Core Protocols
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Predict */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/10 hover:border-neon-cyan/40 transition-all duration-300 space-y-4 shadow-sm hover:shadow-neon-cyan group">
            <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center text-neon-cyan transition-colors group-hover:bg-neon-cyan group-hover:text-cyber-dark">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold font-cyber-title text-white uppercase">1. Predict</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Submit your metrics (BMI, blood sugar, lipid count) to our Random Forest scikit-learn classifiers to generate immediate disease risk indices.
            </p>
          </div>

          {/* Card 2: Prevent */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/10 hover:border-neon-emerald/40 transition-all duration-300 space-y-4 shadow-sm hover:shadow-neon-emerald group">
            <div className="w-12 h-12 rounded-xl bg-neon-emerald/10 flex items-center justify-center text-neon-emerald transition-colors group-hover:bg-neon-emerald group-hover:text-cyber-dark">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold font-cyber-title text-white uppercase">2. Prevent</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Track daily metrics like hydration and sleep cycles. Program active medicine timers that ring to alert you when scheduled doses are due.
            </p>
          </div>

          {/* Card 3: Protect */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/10 hover:border-neon-purple/40 transition-all duration-300 space-y-4 shadow-sm hover:shadow-neon-purple group">
            <div className="w-12 h-12 rounded-xl bg-neon-purple/10 flex items-center justify-center text-neon-purple transition-colors group-hover:bg-neon-purple group-hover:text-cyber-dark">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold font-cyber-title text-white uppercase">3. Protect</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Diagnose symptoms on-the-go with speech input, converse with our NLP assistant companion, and deploy rapid CPR emergency protocols instantly.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-200/5 dark:border-slate-800/10 py-6 text-center text-xs text-slate-500 font-mono z-10 bg-slate-950/20">
        MediMind AI Console // Predictive Clinical System. All rights reserved.
      </footer>

    </div>
  );
};

export default LandingPage;
