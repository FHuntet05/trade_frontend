import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// CAMBIO 1: Importa nuestra instancia 'api' en lugar de 'axios' genérico.
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
        set({ isLoadingAuth: true });
        try {
          if (!telegramUser) { throw new Error("Datos de usuario de Telegram no encontrados."); }
          
          console.log('[Store] -> syncUserWithBackend: Enviando petición POST a /auth/sync');
          // CAMBIO 2: Usa 'api.post' en lugar de 'axios.post'.
          // La URL ahora es relativa ('/auth/sync') porque la base ya está en axiosConfig.
          const response = await api.post('/auth/sync', { user: telegramUser, refCode });
          
          console.log('[Store] -> syncUserWithBackend: Petición exitosa.');
          const { token, user, settings } = response.data;
          set({ user, token, isAuthenticated: true, settings });
          
        } catch (error) {
          console.error('[Store] -> syncUserWithBackend: CATCH - Error en la petición API.', error.response || error);
          set({ user: null, token: null, isAuthenticated: false });
        } finally {
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