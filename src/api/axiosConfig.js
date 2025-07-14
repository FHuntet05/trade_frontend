// frontend/src/api/axiosConfig.js (ÚNICA FUENTE DE VERDAD PARA LA CONFIGURACIÓN)

import axios from 'axios';
import useUserStore from '../store/userStore'; // Importa el store para leer el token.

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// <<< ESTE ES EL ÚNICO INTERCEPTOR QUE DEBE EXISTIR EN TODO EL PROYECTO >>>
api.interceptors.request.use(
  (config) => {
    // Coge el token del store de Zustand.
    const token = useUserStore.getState().token;

    // Si el token existe, lo adjunta a la cabecera.
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;