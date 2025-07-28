// RUTA: frontend/src/store/adminStore.js (LIMPIEZA POST-UNIFICACIÓN)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const useAdminStore = create(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

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
          // [AUTENTICACIÓN UNIFICADA] - La siguiente línea ya NO es necesaria.
          // api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
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
          // [AUTENTICACIÓN UNIFICADA] - La siguiente línea ya NO es necesaria.
          // api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Error al verificar el token.';
          set({ isLoading: false });
          return { success: false, message };
        }
      },

      logout: () => {
        set({ admin: null, token: null, isAuthenticated: false });
        // [AUTENTICACIÓN UNIFICADA] - La siguiente línea ya NO es necesaria, 
        // porque el interceptor de request dejará de encontrar un token y no lo añadirá.
        // delete api.defaults.headers.common['Authorization'];
      },

      setTwoFactorEnabled: (status) => {
        set((state) => ({ admin: state.admin ? { ...state.admin, isTwoFactorEnabled: status } : null }));
      },

      setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: 'neuro-link-admin-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        token: state.token, 
        admin: state.admin, 
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        state.setHydrated();
        
        // [AUTENTICACIÓN UNIFICADA] - Esta lógica ya no es necesaria aquí.
        // El interceptor de request se encargará de esto en cada llamada.
        // const currentToken = state.token;
        // if (currentToken) {
        //   api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
        // }
      }
    }
  )
);

export default useAdminStore;