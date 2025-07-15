// frontend/src/store/userStore.js (CORREGIDO - Lógica de settings simplificada)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoadingAuth: true,
      settings: null,
      
      // La función fetchSettings ya no es necesaria aquí, la eliminamos.

      login: async ({ initData, startParam }) => {
        set({ isLoadingAuth: true });
        try {
          if (!initData) {
            throw new Error("No se encontraron los datos de Telegram (initData).");
          }

          // --- CAMBIO CLAVE ---
          // Ahora la respuesta del login incluye 'token', 'user' y 'settings'.
          const response = await api.post('/auth/login', { initData, startParam });
          const { token, user, settings } = response.data;
          
          // Guardamos todo en el estado de una sola vez.
          set({ user, token, isAuthenticated: true, settings });
          console.log("Login exitoso y configuración global cargada.");

        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Error desconocido en la autenticación.";
          console.error("Fallo fatal en el login:", errorMessage);
          set({ user: null, token: null, isAuthenticated: false, settings: null });
        } finally {
          console.log("Finalizando estado de carga de autenticación.");
          set({ isLoadingAuth: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false, settings: null });
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

// También debemos ajustar la lógica para cuando un usuario ya tiene una sesión (token).
// El interceptor de Axios necesita obtener el perfil y los settings.
// Por ahora, asumiremos que la lógica de refresco de sesión podría estar en otro lado
// o que se maneja con el login cada vez. Si existe una lógica de "re-autenticación"
// al cargar la app, también debería ser actualizada para manejar la respuesta del perfil.
// Por ahora, la corrección principal es en el flujo de login.

export default useUserStore;