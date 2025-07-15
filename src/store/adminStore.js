// frontend/src/store/adminStore.js (COMPLETO CON LÓGICA 2FA)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const useAdminStore = create(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login/admin', { username, password });
          
          if (data.twoFactorRequired) {
            // El backend nos pide el segundo factor. No estamos autenticados aún.
            set({ isLoading: false });
            return { success: true, twoFactorRequired: true, userId: data.userId };
          }
          
          // Login normal (sin 2FA)
          set({
            admin: { username: data.username, role: data.role, isTwoFactorEnabled: data.isTwoFactorEnabled },
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return { success: true, twoFactorRequired: false };

        } catch (error) {
          const message = error.response?.data?.message || 'Error al iniciar sesión.';
          set({ isLoading: false });
          return { success: false, message };
        }
      },

      // Nueva función para completar el login con el token 2FA
      completeTwoFactorLogin: async (userId, token) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/2fa/verify-login', { userId, token });
          set({
            admin: { username: data.username, role: data.role, isTwoFactorEnabled: data.isTwoFactorEnabled },
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Error al verificar el token.';
          set({ isLoading: false });
          return { success: false, message };
        }
      },

      logout: () => {
        set({ admin: null, token: null, isAuthenticated: false });
        delete api.defaults.headers.common['Authorization'];
      },

      setTwoFactorEnabled: (status) => {
        set((state) => ({ admin: state.admin ? { ...state.admin, isTwoFactorEnabled: status } : null }));
      },
    }),
    {
      name: 'neuro-link-admin-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, admin: state.admin, isAuthenticated: state.isAuthenticated }),
    }
  )
);
export default useAdminStore;