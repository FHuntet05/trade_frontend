// RUTA: frontend/src/store/adminStore.js (COMPLETO CON LÓGICA 2FA Y BLINDAJE DE HIDRATACIÓN)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const useAdminStore = create(
  persist(
    (set, get) => ({
      // --- ESTADO ---
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false, // <-- NUEVO: Bandera de estado para la hidratación.

      // --- ACCIONES ---
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

      // <-- NUEVO: Acción para actualizar el estado de hidratación.
      setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      // --- CONFIGURACIÓN DE PERSISTENCIA ---
      name: 'neuro-link-admin-storage',
      storage: createJSONStorage(() => localStorage),

      // Especifica qué partes del estado se guardan. 'isHydrated' se omite intencionadamente.
      partialize: (state) => ({ 
        token: state.token, 
        admin: state.admin, 
        isAuthenticated: state.isAuthenticated 
      }),

      // <-- CLAVE DE LA SOLUCIÓN: Lógica a ejecutar post-hidratación.
      onRehydrateStorage: () => (state) => {
        // 1. Marca la hidratación como completa.
        state.setHydrated();

        // 2. Re-aplica el token a las cabeceras de axios al iniciar la app.
        const currentToken = state.token;
        if (currentToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
        }
      }
    }
  )
);

export default useAdminStore;