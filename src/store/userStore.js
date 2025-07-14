// frontend/src/store/userStore.js (VERSIÓN FINAL CON ARRANQUE SIMPLIFICADO)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoadingAuth: true, // Siempre empieza en true.

      // La función de LOGIN es ahora la ÚNICA responsable del ciclo de vida del arranque.
      login: async ({ initData, startParam }) => {
        // 1. Inicia el estado de carga.
        set({ isLoadingAuth: true });

        try {
          if (!initData) {
            throw new Error("No se encontraron los datos de Telegram (initData).");
          }

          const response = await api.post('/auth/login', { initData, startParam });
          const { token, user } = response.data;
          
          // 2. Si tiene éxito, guarda el estado de autenticado.
          set({ user, token, isAuthenticated: true });
          console.log("Login exitoso.");

        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Error desconocido en la autenticación.";
          console.error("Fallo fatal en el login:", errorMessage);
          // 2. Si falla, limpia todo.
          set({ user: null, token: null, isAuthenticated: false });
        } finally {
          // 3. (EL PASO MÁS IMPORTANTE)
          // Se ejecuta SIEMPRE, garantizando que la app nunca se quede "pegada".
          console.log("Finalizando estado de carga de autenticación.");
          set({ isLoadingAuth: false });
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
      // Solo persistimos el token. Esto es importante para que el interceptor de Axios
      // funcione en las llamadas a la API *después* del login inicial.
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export default useUserStore;