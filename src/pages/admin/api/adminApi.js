// frontend/src/admin/api/adminApi.js (INSTANCIA DEDICADA PARA EL PANEL)
import axios from 'axios';
import useAdminStore from '../../store/adminStore'; // Importa el store CORRECTO

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const adminApi = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor de PETICIÓN: Se ejecuta ANTES de cada envío.
// A diferencia del axiosConfig.js del usuario, este lee el token desde `useAdminStore`.
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

// Interceptor de RESPUESTA: Gestiona errores globales como 401.
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[Admin API Interceptor] Error 401. Deslogueando administrador.');
      // Llama a la función de logout del store CORRECTO.
      useAdminStore.getState().logout();
      // Redirige al login para evitar que el admin se quede en una página protegida.
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default adminApi;