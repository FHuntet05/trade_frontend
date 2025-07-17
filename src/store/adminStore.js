// frontend/src/store/adminStore.js (VERSIÓN v19.0 - ESTADO SÓLIDO)
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
      isHydrated: false, // La bandera que nos dice si ya cargó desde localStorage

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
        set({ admin: null, token: null, isAuthenticated: false, isHydrated: false });
        delete api.defaults.headers.common['Authorization'];
      },

      setTwoFactorEnabled: (status) => {
        set((state) => ({ admin: state.admin ? { ...state.admin, isTwoFactorEnabled: status } : null }));
      },
      
      setHydrated: () => set({ isHydrated: true }), 
    }),
    {
      name: 'neuro-link-admin-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        token: state.token, 
        admin: state.admin, 
        isAuthenticated: state.isAuthenticated,
        // CORRECCIÓN CRÍTICA: Añadimos 'isHydrated' a la lista de estados persistidos.
        isHydrated: state.isHydrated 
      }),
      onRehydrateStorage: (state) => {
        console.log('[Store] Hidratación completada. Dando señal de listo.');
        state.setHydrated();
      },
    }
  )
);
export default useAdminStore;