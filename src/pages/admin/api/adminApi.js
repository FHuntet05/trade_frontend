// RUTA: frontend/src/pages/admin/api/adminApi.js (VERSIÓN ÚNICA Y DEFINITIVA)
import axios from 'axios';
import useAdminStore from '@/store/adminStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const adminApi = axios.create({
  baseURL: API_BASE_URL,
});

adminApi.interceptors.request.use(
  (config) => {
    // Lee el token del único store de administrador.
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
    // Si cualquier petición falla con 401, desloguea.
    if (error.response && error.response.status === 401) {
      console.warn('[Admin API Interceptor] Error 401. Deslogueando administrador.');
      useAdminStore.getState().logout();
      // No usamos window.location.href para permitir que el router maneje la redirección.
    }
    return Promise.reject(error);
  }
);

export default adminApi;