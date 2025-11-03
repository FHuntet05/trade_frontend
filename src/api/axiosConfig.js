// frontend/src/api/axiosConfig.js (VERSIÓN UNIFICADA Y ROBUSTA v25.0)
import axios from 'axios';

// Detectar automáticamente la URL del backend basándose en el entorno
const getApiBaseUrl = () => {
  // Si está definida la variable de entorno, usarla
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // En producción (Vercel), usar la URL del backend desplegado
  if (import.meta.env.PROD) {
    return 'https://trade-backend-hut.vercel.app/api';
  }
  
  // En desarrollo local
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log(`[Axios Config] API Base URL: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// [AUTENTICACIÓN UNIFICADA] - INICIO DE LA MODIFICACIÓN CRÍTICA
// Se añade un interceptor de PETICIÓN (request).
// Este se ejecuta ANTES de que cada petición sea enviada.
api.interceptors.request.use(
  async (config) => {
    // 1. Importamos dinámicamente el userStore para obtener el estado más reciente.
    // Esto evita dependencias circulares y asegura que usamos la fuente de verdad principal.
    const useUserStore = (await import('../store/userStore')).default;
    const token = useUserStore.getState().token;

    // 2. Si existe un token en el userStore, lo inyectamos en la cabecera.
    // Esto funciona tanto para usuarios normales como para administradores con acceso directo.
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Si hay un error al configurar la petición, lo rechazamos.
    return Promise.reject(error);
  }
);
// [AUTENTICACIÓN UNIFICADA] - FIN DE LA MODIFICACIÓN CRÍTICA


// El interceptor de respuesta se mantiene, es útil para el deslogueo automático.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[Axios Interceptor] Error 401. Deslogueando usuario.');
      const useUserStore = (await import('../store/userStore')).default;
      useUserStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;