// frontend/src/store/userStore.js (CÓDIGO COMPLETO Y CORREGIDO)
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
      
      login: async ({ initData }) => { // <-- CORRECCIÓN: ya no necesitamos 'startParam' aquí
        set({ isLoadingAuth: true });
        try {
          if (!initData) {
            throw new Error("No se encontraron los datos de Telegram (initData).");
          }

          // === INICIO DE LA CORRECCIÓN CRÍTICA ===
          // Se elimina el envío del `startParam` por separado.
          // Enviamos únicamente el `initData` crudo. El backend se encargará
          // de parsearlo y extraer el código de referido de forma segura.
          const response = await api.post('/auth/login', { initData });
          // === FIN DE LA CORRECCIÓN CRÍTICA ===

          const { token, user, settings } = response.data;
          
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

export default useUserStore;