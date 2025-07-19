// frontend/src/api/axiosConfig.js
import axios from 'axios';
import useUserStore from '../store/userStore';

// 1. LEE LA VARIABLE DE ENTORNO. Si no existe, usa la URL local como fallback.
//    - `import.meta.env.VITE_API_BASE_URL` es para proyectos Vite.
//    - Si usas Create React App, cámbialo a `process.env.REACT_APP_API_BASE_URL`.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// 2. LOG DE DEPURACIÓN: Nos permite verificar en la consola del navegador que la URL es correcta.
console.log(`[Axios Config] Conectando a la API en: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 3. INTERCEPTOR DE PETICIÓN (Request): Adjunta el token a cada llamada.
//    Esto es lo que ya tenías, y es correcto.
api.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. INTERCEPTOR DE RESPUESTA (Response): Maneja errores globales como la expiración del token.
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, no hace nada.
  (error) => {
    // Si el error es un 401, significa que nuestra sesión ya no es válida.
    if (error.response && error.response.status === 401) {
      console.warn('[Axios Interceptor] Error 401 Unauthorized. El token puede ser inválido o haber expirado. Realizando logout.');
      // Llama a la acción de logout del store para limpiar la sesión.
      useUserStore.getState().logout();
      // Opcionalmente, podrías redirigir a una página de "sesión expirada".
    }
    return Promise.reject(error);
  }
);

export default api;