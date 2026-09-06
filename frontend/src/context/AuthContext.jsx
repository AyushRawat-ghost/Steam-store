import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('steam_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check current session on mount if token is stored
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res && res.data) {
          setUser(res.data);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      const authToken = res.data?.token || res.token;
      const userData = res.data?.user || res.user;

      if (authToken) {
        localStorage.setItem('steam_token', authToken);
        setToken(authToken);
        setUser(userData);
        return { success: true, user: userData };
      }
      throw new Error('Token not received from server');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Register handler
  const register = async ({ email, username, password, role }) => {
    setError(null);
    try {
      const res = await authApi.register({
        email,
        username,
        password,
        role: role || 'gamer',
      });
      const authToken = res.data?.token || res.token;
      const userData = res.data?.user || res.user;

      if (authToken) {
        localStorage.setItem('steam_token', authToken);
        setToken(authToken);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: true, data: res };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('steam_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    role: user?.role || null,
    isGamer: user?.role === 'gamer',
    isAdmin: user?.role === 'admin',
    isDev: user?.role === 'developer',
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
