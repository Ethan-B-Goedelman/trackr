import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Update this to your deployed API URL or local IP for device testing
const BASE_URL = 'http://137.184.237.129/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

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
  (error) => {
    if (error.response?.status === 401) {
      SecureStore.deleteItemAsync('trackr_token').catch(() => {});
    }
    return Promise.reject(error);
  }
);

export default api;
