// frontend/src/store/userStore.js (VERSIÓN FINAL CON RUTA DE LOGIN CORREGIDA)

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

const useUserStore = create(
  persist(
    (set, get) => ({
      user: undefined, 
      token: null,
      error: null,

      checkAuthStatus: async () => {
        const token = get().token;
        if (!token) {
          set({ user: null });
          return 'no-token';
        }
        try {
          const response = await api.get('/auth/profile');
          set({ user: response.data, error: null });
          return 'authenticated';
        } catch (error) {
          console.error("Token inválido o expirado:", error);
          set({ user: null, token: null, error: 'Tu sesión ha expirado.' });
          return 'invalid-token';
        }
      },

      login: async ({ initData, startParam }) => {
        if (!initData) {
          const errorMessage = "No se pudo obtener la información de Telegram (initData).";
          set({ error: errorMessage, token: null, user: null });
          return;
        }
        
        set({ error: null });
        try {
          // --- LA CORRECCIÓN ESTÁ AQUÍ ---
          // Cambiamos '/auth/telegram' por '/auth/login' para que coincida con el backend.
          const response = await api.post('/auth/login', { initData, startParam });
          const { token, user } = response.data;
          set({ user, token, error: null });
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Error en la autenticación con el servidor.";
          console.error("Fallo en el login:", errorMessage);
          set({ error: errorMessage, token: null, user: null });
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
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