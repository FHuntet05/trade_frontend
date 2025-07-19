// frontend/src/store/userStore.js (CÓDIGO COMPLETO CON LOGGING)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoadingAuth: true,
      settings: null,
      
      syncUserWithBackend: async (telegramUser, refCode) => {
        // === LOG: INICIO DE LA ACCIÓN ===
        console.log('[Store] -> syncUserWithBackend: INICIADO. Estableciendo isLoadingAuth = true.');
        set({ isLoadingAuth: true });

        try {
          if (!telegramUser) { throw new Error("Datos de usuario de Telegram no encontrados."); }

          // === LOG: DATOS ENVIADOS A LA API ===
          console.log('[Store] -> syncUserWithBackend: Enviando petición POST a /api/auth/sync con body:', { user: telegramUser, refCode });
          const response = await api.post('/auth/sync', { user: telegramUser, refCode });
          
          // === LOG: RESPUESTA EXITOSA DE LA API ===
          console.log('[Store] -> syncUserWithBackend: Petición exitosa. Respuesta recibida:', response.data);
          const { token, user, settings } = response.data;
          set({ user, token, isAuthenticated: true, settings });
          
        } catch (error) {
          // === LOG: ERROR EN LA PETICIÓN API ===
          console.error('[Store] -> syncUserWithBackend: CATCH - Error en la petición API.', error.response || error);
          const errorMessage = error.response?.data?.message || error.message || "Error en la sincronización.";
          console.error("Fallo fatal en la sincronización:", errorMessage);
          set({ user: null, token: null, isAuthenticated: false });

        } finally {
          // === LOG: FINALIZACIÓN DE LA PROMESA ===
          console.log('[Store] -> syncUserWithBackend: FINALLY - Bloque finally alcanzado. Estableciendo isLoadingAuth = false.');
          set({ isLoadingAuth: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false, settings: null });
      },
      
      updateUser: (updatedUserData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUserData } : updatedUserData,
        }));
      },
    }),
    {
      name: 'neuro-link-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
);
export default useUserStore;