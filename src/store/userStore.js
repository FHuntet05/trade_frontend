// frontend/src/store/userStore.js (COMPLETO CON CONFIGURACIÓN GLOBAL)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoadingAuth: true,
      settings: null, // <-- NUEVO: Estado para la configuración global
      
      // Nueva acción para obtener la configuración
      fetchSettings: async () => {
        try {
          // Usamos el endpoint público que creamos (aunque esté protegido, Axios adjuntará el token)
          // Asumimos que la configuración puede ser obtenida desde un endpoint público o uno protegido
          // Para este caso, usaremos el endpoint de admin, ya que requiere token.
          // NOTA: Si la configuración debe ser pública, se necesitaría un endpoint separado.
          // Por ahora, asumimos que solo los usuarios autenticados pueden verla.
          const { data } = await api.get('/admin/settings');
          set({ settings: data });
          console.log("Configuración global cargada.");
        } catch (error) {
          console.error("Error al cargar la configuración global:", error);
          // No hacemos nada drástico, la app puede funcionar con valores por defecto
        }
      },

      login: async ({ initData, startParam }) => {
        set({ isLoadingAuth: true });
        try {
          if (!initData) {
            throw new Error("No se encontraron los datos de Telegram (initData).");
          }

          const response = await api.post('/auth/login', { initData, startParam });
          const { token, user } = response.data;
          
          set({ user, token, isAuthenticated: true });
          console.log("Login exitoso.");
          
          // --- ACCIÓN CLAVE ---
          // Después de un login exitoso, obtenemos la configuración de la app.
          await get().fetchSettings();

        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Error desconocido en la autenticación.";
          console.error("Fallo fatal en el login:", errorMessage);
          set({ user: null, token: null, isAuthenticated: false });
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