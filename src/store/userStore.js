// frontend/src/store/userStore.js (VERSIÓN REFERIDO INSTANTÁNEO v30.0)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

// Interceptores para añadir el token a las cabeceras y manejar errores 401 (sin cambios)
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
  async (error) => {
    if (error.response && error.response.status === 401) {
      const useUserStore = (await import('./userStore')).default;
      useUserStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

const useUserStore = create(
  persist(
    (set, get) => ({
      // --- ESTADOS DEL STORE ---
      user: null, 
      token: null, 
      isAuthenticated: false, 
      isLoadingAuth: true, 
      settings: null,
      
      /**
       * Sincroniza los datos del usuario de Telegram con el backend.
       * Esta función NO envía ningún código de referido.
       * @param {object} telegramUser - El objeto `user` de `window.Telegram.WebApp.initDataUnsafe`.
       */
      syncUserWithBackend: async (telegramUser) => {
        // Ponemos el estado de carga en `true` para mostrar loaders en la UI.
        set({ isLoadingAuth: true });
        try {
          console.log('[Store] Enviando datos de usuario al backend para sincronizar...');
          // La llamada a la API ya no necesita `refCode`.
          const response = await api.post('/auth/sync', { telegramUser });
          
          const { token, user, settings } = response.data;
          
          // Actualizamos el store con la información recibida del backend.
          set({ 
              user, 
              token, 
              isAuthenticated: true, 
              settings, 
              isLoadingAuth: false 
            });
          console.log('[Store] Sincronización completada con éxito.');

        } catch (error) {
          // En caso de error, lo registramos y reseteamos el estado de autenticación.
          console.error('Error fatal al sincronizar usuario:', error);
          set({ 
              user: null, 
              token: null, 
              isAuthenticated: false, 
              isLoadingAuth: false 
            });
        }
      },

      // updateUser y logout no se han incluido por brevedad, pero su código anterior es correcto.
      // Se recomienda mantenerlos si los usa en otras partes de la app.
      
    }),
    {
      name: 'neuro-link-storage', // Nombre para el almacenamiento local
      storage: createJSONStorage(() => localStorage), // Usamos localStorage
      // Solo guardamos el token en el almacenamiento persistente.
      // El resto de los datos se obtienen frescos en cada carga.
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export default useUserStore;