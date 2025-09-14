// frontend/src/pages/admin/api/adminApi.js (RUTA DEFINITIVA CORREGIDA)
import axios from 'axios';
// [SOLUCIÓN DEFINITIVA] Se corrige la ruta para que coincida con la estructura de carpetas real.
import useAdminStore from '@/store/adminStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const adminApi = axios.create({
  baseURL: API_BASE_URL,
});

adminApi.interceptors.request.use(
  (config) => {
    const token = useAdminStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[Admin API Interceptor] Error 401. Deslogueando administrador.');
      useAdminStore.getState().logout();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default adminApi;