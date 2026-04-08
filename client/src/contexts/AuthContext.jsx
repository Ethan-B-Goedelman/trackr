import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('trackr_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const token = localStorage.getItem('trackr_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('trackr_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('trackr_token');
        localStorage.removeItem('trackr_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('trackr_token', token);
    localStorage.setItem('trackr_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('trackr_token');
    localStorage.removeItem('trackr_user');
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    const res = await api.post('/auth/reset-password', { token, password });
    return res.data;
  }, []);

  const verifyEmail = useCallback(async (token) => {
    const res = await api.get(`/auth/verify-email?token=${token}`);
    const { token: jwt, user: userData } = res.data;
    localStorage.setItem('trackr_token', jwt);
    localStorage.setItem('trackr_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, forgotPassword, resetPassword, verifyEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
