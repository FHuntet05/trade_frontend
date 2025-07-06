// frontend/src/store/userStore.js (VERSIÓN FINAL CON checkAuthStatus)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

// El interceptor se mantiene igual, es una excelente implementación.
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
          set({ user: null }); // No hay token, no hay sesión.
          return 'no-token'; // Devolvemos un estado para que App.jsx sepa qué hacer.
        }
        try {
          const response = await api.get('/auth/profile');
          set({ user: response.data, error: null });
          return 'authenticated'; // Sesión válida.
        } catch (error) {
          console.error("Token inválido o expirado:", error);
          set({ user: null, token: null, error: 'Tu sesión ha expirado.' });
          return 'invalid-token'; // Sesión inválida.
        }
      },

      // --- FUNCIÓN DE LOGIN MODIFICADA ---
      // Ahora solo acepta la 'initData' de Telegram.
      login: async (initData) => {
        if (!initData) {
          const errorMessage = "No se pudo obtener la información de Telegram (initData).";
          set({ error: errorMessage, token: null, user: null });
          return;
        }
        
        set({ error: null });
        try {
          // Enviamos la initData completa al backend.
          const response = await api.post('/auth/telegram', { initData });
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
