// frontend/src/store/userStore.js (VERSIÓN FINAL SIMPLIFICADA Y ROBUSTA)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoadingAuth: true, // Siempre empieza en true al cargar la app

      // Nueva acción para garantizar que siempre salimos del estado de carga
      finishInitialLoading: () => {
        set({ isLoadingAuth: false });
      },

      checkAuthStatus: async () => {
        const token = get().token;
        if (!token) {
          set({ isAuthenticated: false });
          return 'no-token';
        }
        try {
          const response = await api.get('/auth/profile');
          set({ user: response.data, isAuthenticated: true });
          return 'authenticated';
        } catch (error) {
          console.error("Fallo en checkAuthStatus (token inválido):", error);
          set({ token: null, isAuthenticated: false }); // Limpiamos el token inválido
          return 'invalid-token';
        }
      },

      login: async ({ initData, startParam }) => {
        if (!initData) {
          console.error("Intento de login sin initData.");
          return; // No hacemos nada si no hay datos
        }
        try {
          const response = await api.post('/auth/login', { initData, startParam });
          const { token, user } = response.data;
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          console.error("Fallo en la función login:", error.response?.data?.message || error.message);
          set({ user: null, token: null, isAuthenticated: false }); // Limpiamos en caso de error
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false });
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