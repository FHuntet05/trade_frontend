// frontend/src/store/userStore.js (VERSIÓN CORREGIDA FINAL v24.0)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

api.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
          const response = await api.post('/auth/sync', { user: telegramUser, refCode });
          const { token, user, settings } = response.data;
          set({ user, token, isAuthenticated: true, settings, isLoadingAuth: false });
        } catch (error) {
          console.error('Error al sincronizar usuario:', error);
          set({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false });
        }
      },
      
      // ======================= INICIO DE LA NUEVA FUNCIÓN =======================
      // Esta es la función que faltaba en PurchaseModal.jsx.
      // Simplemente actualiza el objeto de usuario en el estado.
      updateUser: (newUserObject) => {
        set((state) => ({
          ...state,
          user: newUserObject,
        }));
      },
      // ======================== FIN DE LA NUEVA FUNCIÓN =========================

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false });
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