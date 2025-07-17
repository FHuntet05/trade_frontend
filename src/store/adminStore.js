// frontend/src/store/adminStore.js (VERSIÓN v18.12 - ADAPTADO A TU LÓGICA CON HIDRATACIÓN)
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
      isHydrated: false, // <-- LÍNEA 1/3 AÑADIDA: La bandera de estado.

      login: async (username, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login/admin', { username, password });
          
          if (data.twoFactorRequired) {
            set({ isLoading: false });
            return { success: true, twoFactorRequired: true, userId: data.userId };
          }
          
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

      // LÍNEA 2/3 AÑADIDA: La acción para cambiar la bandera.
      setHydrated: () => set({ isHydrated: true }), 
    }),
    {
      name: 'neuro-link-admin-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, admin: state.admin, isAuthenticated: state.isAuthenticated }),
      // LÍNEA 3/3 AÑADIDA: Esta función se ejecuta automáticamente cuando Zustand termina de cargar desde localStorage.
      onRehydrateStorage: (state) => {
        console.log('[Store] Hidratación completada. Dando señal de listo.');
        state.setHydrated();
      },
    }
  )
);
export default useAdminStore;