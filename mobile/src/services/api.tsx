import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://137.184.237.129/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Callback registered by AuthContext so the interceptor can trigger logout
// without creating a circular import dependency.
let _onUnauthorized: (() => void) | null = null;

export const setUnauthorizedCallback = (fn: () => void) => {
  _onUnauthorized = fn;
};

export const clearUnauthorizedCallback = () => {
  _onUnauthorized = null;
};

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('trackr_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear stored token
      await SecureStore.deleteItemAsync('trackr_token').catch(() => {});
      // Notify AuthContext so React state is also reset
      if (_onUnauthorized) _onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
