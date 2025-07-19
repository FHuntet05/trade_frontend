// frontend/src/api/axiosConfig.js (VERSIÓN CORREGIDA v24.0)
import axios from 'axios';

// ATENCIÓN: El import de 'useUserStore' se ha movido al interceptor de respuesta
// para evitar la dependencia circular en la carga inicial del módulo.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
console.log(`[Axios Config] API Base URL: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// El interceptor de respuesta se puede configurar aquí, pero el de petición
// que necesita el token DEBE ser configurado dinámicamente o la lógica
// debe ser manejada en el store. Para la máxima robustez, moveremos toda
// la lógica que depende del store a un punto de configuración explícito.

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[Axios Interceptor] Error 401. Deslogueando usuario.');
      // Importación dinámica para romper el ciclo. Se importa SOLO cuando es necesario.
      const useUserStore = (await import('../store/userStore')).default;
      useUserStore.getState().logout(); // Asumimos que existirá una función logout
    }
    return Promise.reject(error);
  }
);

export default api;