// frontend/src/store/userStore.js (CÓDIGO COMPLETO Y RECONSTRUIDO)
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
      
      // La nueva función de sincronización. Es llamada por la página principal.
      syncUserWithBackend: async (telegramUser, refCode) => {
        set({ isLoadingAuth: true });
        try {
          if (!telegramUser) {
            throw new Error("Datos de usuario de Telegram no encontrados.");
          }

          // Llama al nuevo endpoint de sincronización
          const response = await api.post('/auth/sync', { user: telegramUser, refCode });
          const { token, user, settings } = response.data;
          
          set({ user, token, isAuthenticated: true, settings, isLoadingAuth: false });
          console.log("Sincronización y login exitosos.");
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Error en la sincronización.";
          console.error("Fallo fatal en la sincronización:", errorMessage);
          set({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, settings: null });
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