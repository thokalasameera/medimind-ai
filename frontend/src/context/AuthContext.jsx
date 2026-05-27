import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const API_URL = 'http://localhost:5000/api';
export const ML_API_URL = 'http://localhost:5005';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
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
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
            setToken(savedToken);
          } else {
            // Token expired or invalid
            localStorage.removeItem('medimind_token');
          }
        } catch (err) {
          console.error("Session verification failed:", err);
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
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Registration failed." };
      }
    } catch (err) {
      return { success: false, error: "Network error. Please make sure the server is running." };
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
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Invalid credentials." };
      }
    } catch (err) {
      return { success: false, error: "Network error. Please make sure the server is running." };
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
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: "Network error. Profile update failed." };
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

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
