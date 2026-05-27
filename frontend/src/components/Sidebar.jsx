import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Activity, 
  Stethoscope, 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  User, 
  LogOut, 
  Moon, 
  Sun, 
  AlertTriangle 
} from 'lucide-react';

const Sidebar = ({ triggerEmergency }) => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: Activity },
    { to: "/symptoms", label: "Symptom Checker", icon: Stethoscope },
    { to: "/predictions", label: "Prediction Reports", icon: TrendingUp },
    { to: "/chatbot", label: "AI Health Chat", icon: MessageSquare },
    { to: "/reminders", label: "Reminders", icon: Clock },
    { to: "/profile", label: "Profile Settings", icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-slate-200/10 dark:border-slate-800/20 py-6 px-4 flex flex-col justify-between z-30 transition-colors duration-300">
      <div>
        {/* LOGO */}
        <div className="flex items-center space-x-3 px-2 mb-8 cursor-pointer" onClick={() => navigate("/dashboard")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-glow to-neon-indigo flex items-center justify-center shadow-neon-cyan animate-pulse-slow">
            <Activity className="w-6 h-6 text-cyber-dark dark:text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-cyber-dark dark:text-white tracking-wider font-cyber-title">
              MediMind <span className="text-neon-cyan font-extrabold text-xs">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
              Predict. Prevent.
            </p>
          </div>
        </div>

        {/* PROFILE CHIP */}
        {user && (
          <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-slate-100/5 border border-slate-200/10 mb-6">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-purple to-neon-indigo flex items-center justify-center text-white font-extrabold shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-emerald-400 dark:text-emerald-500 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1.5 animate-ping"></span>
                Connected
              </p>
            </div>
          </div>
        )}

        {/* NAVIGATION LINKS */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-indigo/5 text-neon-cyan border-l-4 border-neon-cyan shadow-neon-cyan' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/10 hover:text-cyber-dark dark:hover:text-white border-l-4 border-transparent'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="space-y-3">
        {/* EMERGENCY CONSOLE PANEL TRIGGER */}
        <button 
          onClick={triggerEmergency}
          className="w-full flex items-center justify-center space-x-2.5 py-3 px-4 bg-gradient-to-r from-red-500/15 to-neon-crimson/5 border border-neon-crimson/30 hover:border-neon-crimson/80 text-neon-crimson hover:bg-neon-crimson hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-neon-crimson group"
        >
          <AlertTriangle className="w-4 h-4 animate-bounce group-hover:animate-none" />
          <span>Emergency Alert</span>
        </button>

        {/* THEME TOGGLE AND LOGOUT */}
        <div className="flex items-center justify-between border-t border-slate-200/10 pt-4 px-2">
          {/* THEME SWITCHER */}
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-slate-200/10 dark:bg-slate-800/30 hover:bg-slate-200/20 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all duration-300"
            title={theme === 'dark' ? "Enable Solar Console" : "Enable Quantum Console"}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>

          {/* LOGOUT */}
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl bg-slate-200/10 dark:bg-slate-800/30 hover:bg-red-500/20 text-slate-500 dark:text-slate-400 hover:text-red-400 flex items-center justify-center transition-all duration-300"
            title="Disconnect Terminal Session"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
