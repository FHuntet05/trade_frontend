// frontend/src/store/userStore.js (CÓDIGO VALIDADO - NO REQUIERE CAMBIOS)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoadingAuth: true, // Inicia como true por defecto en la primera carga.
      settings: null,
      
      syncUserWithBackend: async (telegramUser, refCode) => {
        console.log('[Store] -> syncUserWithBackend: INICIADO.');
        set({ isLoadingAuth: true });

        try {
          if (!telegramUser) { throw new Error("Datos de usuario de Telegram no encontrados."); }
          
          console.log('[Store] -> syncUserWithBackend: Enviando POST a /api/auth/sync con:', { user: telegramUser, refCode });
          const response = await api.post('/auth/sync', { user: telegramUser, refCode });
          
          const { token, user, settings } = response.data;
          console.log('[Store] -> syncUserWithBackend: Sincronización exitosa. Usuario:', user.username);
          
          set({ user, token, isAuthenticated: true, settings });
          
        } catch (error) {
          console.error('[Store] -> syncUserWithBackend: CATCH - Error en la petición API.', error.response || error);
          // Limpia el estado en caso de un fallo de sincronización
          set({ user: null, token: null, isAuthenticated: false, settings: null });
        } finally {
          console.log('[Store] -> syncUserWithBackend: FINALLY - Sincronización finalizada.');
          set({ isLoadingAuth: false });
        }
      },

      logout: () => {
        console.log('[Store] -> logout: Limpiando sesión.');
        set({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false, settings: null });
      },
      
      updateUser: (updatedUserData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUserData } : updatedUserData,
        }));
      },
    }),
    {
      name: 'neuro-link-storage', // Nombre para el localStorage
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos el token. El resto del estado se obtiene en cada carga
      // para asegurar que los datos estén frescos.
      partialize: (state) => ({ token: state.token }), 
    }
  )
);

export default useUserStore;