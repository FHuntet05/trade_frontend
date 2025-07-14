// frontend/src/store/userStore.js (VERSIÓN CORREGIDA SIN INTERCEPTOR)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// <<< La única importación de api debe estar aquí.
import api from '../api/axiosConfig';

const useUserStore = create(
  persist(
    (set, get) => ({
      // Mantenemos tu estado inicial y tus funciones, están bien.
      user: undefined, 
      token: null,
      error: null,
      isAuthenticated: false, // Añadido para un seguimiento más claro

      checkAuthStatus: async () => {
        const token = get().token;
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return 'no-token';
        }
        try {
          const response = await api.get('/auth/profile');
          set({ user: response.data, error: null, isAuthenticated: true });
          return 'authenticated';
        } catch (error) {
          console.error("Token inválido o expirado:", error);
          set({ user: null, token: null, error: 'Tu sesión ha expirado.', isAuthenticated: false });
          return 'invalid-token';
        }
      },

      login: async ({ initData, startParam }) => {
        if (!initData) {
          const errorMessage = "No se pudo obtener la información de Telegram (initData).";
          set({ error: errorMessage, token: null, user: null, isAuthenticated: false });
          return;
        }
        
        set({ error: null });
        try {
          const response = await api.post('/auth/login', { initData, startParam });
          const { token, user } = response.data;
          set({ user, token, error: null, isAuthenticated: true });
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Error en la autenticación con el servidor.";
          console.error("Fallo en el login:", errorMessage);
          set({ error: errorMessage, token: null, user: null, isAuthenticated: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null, isAuthenticated: false });
      },
      
      updateUser: (updatedUserData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUserData } : updatedUserData,
        }));
      },
    }),
    {
      name: 'neuro-link-storage', // Tu nombre de almacenamiento está bien.
      storage: createJSONStorage(() => localStorage),
      // Tu configuración para guardar solo el token también es correcta.
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export default useUserStore;