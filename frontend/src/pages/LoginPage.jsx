import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldCheck, Mail, Lock, User, AlertCircle, Loader } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      setError("Please satisfy all required parameters.");
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      if (isRegister) {
        const res = await register(name, email, password);
        if (res.success) {
          navigate("/dashboard");
        } else {
          setError(res.error);
        }
      } else {
        const res = await login(email, password);
        if (res.success) {
          navigate("/dashboard");
        } else {
          setError(res.error);
        }
      }
    } catch (err) {
      setError("Failed to communicate with MediMind Core server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark bg-grid-cyber flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* GLOWING AMBIENT LIGHTS */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-neon-cyan/10 rounded-full filter blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-neon-indigo/10 rounded-full filter blur-[140px] pointer-events-none"></div>

      {/* CORE LOGIN FORM GLASS CARD */}
      <div className="w-full max-w-md z-10 transition-all duration-500">
        
        {/* LOGO TITLE */}
        <div className="flex flex-col items-center mb-6 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyber-glow to-neon-indigo flex items-center justify-center shadow-neon-cyan animate-pulse-slow mb-3">
            <Activity className="w-7 h-7 text-cyber-dark dark:text-white" />
          </div>
          <h1 className="text-2xl font-black font-cyber-title tracking-wider text-white">
            MediMind <span className="text-neon-cyan font-black">AI</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-1">
            Predict. Prevent. Protect.
          </p>
        </div>

        <GlassCard glowColor="cyan" className="shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-cyber-title">
              {isRegister ? "Register Bio-Profile" : "AI Healthcare Sign In"}
            </h2>
            {isRegister && (
              <p className="text-xs text-slate-400 mt-1.5 font-mono">
                Create your secure profile to access personalized health insights
              </p>
            )}
          </div>

          {/* GLOWING ERROR BLOCK */}
          {error && (
            <div className="flex items-center space-x-3 p-3 bg-neon-crimson/10 border border-neon-crimson/25 text-neon-crimson rounded-xl text-xs font-semibold mb-5 font-mono">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* FORM FIELDS */}
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            
            {/* NAME FIELD (only for Register) */}
            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider flex items-center">
                  <User className="w-3.5 h-3.5 mr-2 text-neon-cyan" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-200/10 dark:border-slate-800/30 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 text-xs transition-colors"
                />
              </div>
            )}

            {/* EMAIL FIELD */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider flex items-center">
                <Mail className="w-3.5 h-3.5 mr-2 text-neon-cyan" />
                Terminal Email
              </label>
              <input
                type="email"
                required
                placeholder="patient@medimind.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-200/10 dark:border-slate-800/30 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 text-xs transition-colors"
              />
            </div>

            {/* PASSWORD FIELD */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider flex items-center">
                <Lock className="w-3.5 h-3.5 mr-2 text-neon-cyan" />
                Security Passkey
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-200/10 dark:border-slate-800/30 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 text-xs transition-colors"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r from-neon-cyan to-neon-indigo hover:from-cyan-400 hover:to-indigo-500 text-cyber-darker font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-md shadow-neon-cyan/15 active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Synchronizing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isRegister ? "Index Profile" : "Access Terminal"}</span>
                </>
              )}
            </button>

          </form>

          {/* MODE SELECTOR TOGGLE */}
          <div className="text-center mt-6 pt-4 border-t border-slate-200/5 dark:border-slate-850/10">
            <button
              onClick={toggleMode}
              className="text-xs text-neon-cyan hover:text-white transition-colors font-mono"
            >
              {isRegister 
                ? "Already have an account? Sign in here" 
                : "Don't have an account? Register here"
              }
            </button>
          </div>

        </GlassCard>
      </div>

    </div>
  );
};

export default LoginPage;
