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
        try {
          const response = await api.post('/api/auth/sync', { user: telegramUser, refCode });
          const { token, user, settings } = response.data;
          set({ user, token, isAuthenticated: true, settings });
        } catch (error) {
          console.error('Error al sincronizar usuario:', error);
          set({ user: null, token: null, isAuthenticated: false });
        } finally {
          set({ isLoadingAuth: false });
        }
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