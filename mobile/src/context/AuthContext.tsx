import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import api, { setUnauthorizedCallback, clearUnauthorizedCallback } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('trackr_token').catch(() => {});
    setUser(null);
  }, []);

  // Wire the 401 interceptor in api.tsx to call logout() so that
  // when a token expires mid-session, React state is also reset
  // and the app navigates back to the login screen automatically.
  useEffect(() => {
    setUnauthorizedCallback(logout);
    return () => clearUnauthorizedCallback();
  }, [logout]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await SecureStore.getItemAsync('trackr_token');
        if (token) {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        }
      } catch {
        await SecureStore.deleteItemAsync('trackr_token').catch(() => {});
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    await SecureStore.setItemAsync('trackr_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
