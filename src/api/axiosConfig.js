// frontend/src/api/axiosConfig.js (CÓDIGO FINAL)
import axios from 'axios';
import useUserStore from '../store/userStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
console.log(`[Axios Config] API Base URL: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[Axios Interceptor] Error 401. Deslogueando usuario.');
      useUserStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;