// frontend/src/api/axiosConfig.js (VERSIÓN FINAL CON INTERCEPTOR DE AUTENTICACIÓN)

import axios from 'axios';
// <<< 1. Importamos el store de Zustand para poder acceder al token.
import useUserStore from '../store/userStore';

// Creamos la instancia de Axios con la URL base de nuestro backend.
// Asegúrate de que VITE_API_BASE_URL esté definida en tus variables de entorno del frontend en Render.
// Por ejemplo: VITE_API_BASE_URL=https://linker-backend-tqgy.onrender.com/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// --- INTERCEPTOR DE PETICIONES (LA SOLUCIÓN CLAVE) ---
// Esta función se ejecutará ANTES de que cada petición sea enviada al backend.
api.interceptors.request.use(
  (config) => {
    // <<< 2. Obtenemos el token directamente del estado de Zustand.
    // Usamos .getState() porque estamos fuera de un componente de React y no podemos usar el hook.
    const token = useUserStore.getState().token;

    // <<< 3. Si el token existe, lo añadimos a la cabecera 'Authorization'.
    // El formato 'Bearer TOKEN' es el estándar que el backend espera.
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Devolvemos la configuración modificada para que la petición continúe su viaje.
    return config;
  },
  (error) => {
    // Si ocurre un error al configurar la petición, lo devolvemos como una promesa rechazada.
    return Promise.reject(error);
  }
);

export default api;