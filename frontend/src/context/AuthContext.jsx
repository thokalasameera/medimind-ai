import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const RENDER_API = 'https://medimind-backend-g6el.onrender.com/api';

export const API_URL = isLocal
  ? 'http://localhost:5000/api'
  : (import.meta.env.PROD
      ? RENDER_API
      : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api'));

export const ML_API_URL = isLocal
  ? 'http://localhost:5005'
  : (import.meta.env.PROD
      ? (import.meta.env.VITE_ML_API_URL || '')
      : (import.meta.env.VITE_ML_API_URL || 'http://localhost:5005'));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('medimind_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('medimind_token');
  });
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const checkSession = async () => {
      const savedToken = localStorage.getItem('medimind_token');
      if (savedToken) {
        try {
          const res = await fetch(`${API_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setUser(data.user);
              localStorage.setItem('medimind_user', JSON.stringify(data.user));
              setToken(savedToken);
            }
          } else {
            const data = await res.json().catch(() => ({}));
            if (data.error === "Patient profile not found.") {
              console.warn("Express backend database reset. Continuing in local sandbox demo mode.");
            } else {
              // Token expired/malformed, clear it
              localStorage.removeItem('medimind_token');
              localStorage.removeItem('medimind_user');
              setToken(null);
              setUser(null);
            }
          }
        } catch (err) {
          console.warn("Session verification network error. Using cached local user session.", err);
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  // REGISTER PATIENT
  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('medimind_token', data.token);
        localStorage.setItem('medimind_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Registration failed." };
      }
    } catch (err) {
      console.error('Register failed:', API_URL, err);
      return {
        success: false,
        error: import.meta.env.PROD
          ? 'Cannot reach server. Wait 60 sec (Render waking up) and try again.'
          : 'Network error. Please make sure the server is running.',
      };
    }
  };

  // LOG IN PATIENT
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('medimind_token', data.token);
        localStorage.setItem('medimind_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Invalid credentials." };
      }
    } catch (err) {
      console.error('Login failed:', API_URL, err);
      return {
        success: false,
        error: import.meta.env.PROD
          ? 'Cannot reach server. Wait 60 sec (Render waking up) and try again.'
          : 'Network error. Please make sure the server is running.',
      };
    }
  };

  // REFRESH PROFILE FROM SERVER
  const refreshProfile = async () => {
    const activeToken = token || localStorage.getItem('medimind_token');
    if (!activeToken) return { success: false };

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('medimind_user', JSON.stringify(data.user));
        setToken(activeToken);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  };

  // LOG OUT
  const logout = () => {
    localStorage.removeItem('medimind_token');
    localStorage.removeItem('medimind_user');
    setToken(null);
    setUser(null);
  };

  // UPDATE BIO PROFILE
  const updateProfile = async (profileData) => {
    try {
      if (!token) return { success: false, error: "Not authenticated." };
      
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('medimind_user', JSON.stringify(data.user));
        return { success: true, message: data.message };
      } else {
        if (data.error === "Patient profile not found.") {
          // Fallback update in local storage when server database reset
          const fallbackUser = { ...user, ...profileData };
          setUser(fallbackUser);
          localStorage.setItem('medimind_user', JSON.stringify(fallbackUser));
          return { success: true, message: "Bio-profile synchronized locally (Demo Mode Active)." };
        }
        return { success: false, error: data.error };
      }
    } catch (err) {
      // Catch network error
      const fallbackUser = { ...user, ...profileData };
      setUser(fallbackUser);
      localStorage.setItem('medimind_user', JSON.stringify(fallbackUser));
      return { success: true, message: "Bio-profile synchronized locally (Demo Mode Active)." };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
export default AuthContext;
