import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import EmergencyAlert from './components/EmergencyAlert';

// Page Imports
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker';
import PredictionReports from './pages/PredictionReports';
import Chatbot from './pages/Chatbot';
import MedicineReminders from './pages/MedicineReminders';
import ProfileSettings from './pages/ProfileSettings';

// Loader component for loading bio-sessions
const BioConsoleLoader = () => (
  <div className="min-h-screen bg-cyber-dark flex flex-col items-center justify-center space-y-4 font-mono">
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-neon-cyan to-neon-indigo flex items-center justify-center animate-spin">
      <div className="w-8 h-8 rounded-xl bg-cyber-dark"></div>
    </div>
    <p className="text-xs text-neon-cyan uppercase tracking-widest animate-pulse font-bold">
      Synchronizing circandian telemetry...
    </p>
  </div>
);

// Protected routes layout gatekeeper
const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  if (loading) {
    return <BioConsoleLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-cyber-dark text-slate-800 dark:text-slate-200 transition-colors duration-300 relative flex bg-grid-cyber">
      
      {/* GLOWING SHADOW BACKDROP EFFECT */}
      <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-neon-cyan/5 rounded-full filter blur-[100px] pointer-events-none"></div>

      {/* SIDEBAR NAVIGATION */}
      <Sidebar triggerEmergency={() => setIsEmergencyOpen(true)} />

      {/* EMERGENCY MODAL TRIGGER BLOCK */}
      <EmergencyAlert isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />

      {/* MAIN VIEWPORT PANELS */}
      <main className="flex-1 min-h-screen ml-64 p-8 overflow-y-auto z-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

// Main Routing Architecture
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      {/* PUBLIC PATHS */}
      <Route path="/" element={
        loading ? <BioConsoleLoader /> : isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
      } />
      <Route path="/login" element={
        loading ? <BioConsoleLoader /> : isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />

      {/* PROTECTED MEDICAL COCKPIT MODULES */}
      <Route path="/dashboard" element={
        <ProtectedLayout>
          <Dashboard />
        </ProtectedLayout>
      } />
      <Route path="/symptoms" element={
        <ProtectedLayout>
          <SymptomChecker />
        </ProtectedLayout>
      } />
      <Route path="/predictions" element={
        <ProtectedLayout>
          <PredictionReports />
        </ProtectedLayout>
      } />
      <Route path="/chatbot" element={
        <ProtectedLayout>
          <Chatbot />
        </ProtectedLayout>
      } />
      <Route path="/reminders" element={
        <ProtectedLayout>
          <MedicineReminders />
        </ProtectedLayout>
      } />
      <Route path="/profile" element={
        <ProtectedLayout>
          <ProfileSettings />
        </ProtectedLayout>
      } />

      {/* CATCH-ALL REDIRECT */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
