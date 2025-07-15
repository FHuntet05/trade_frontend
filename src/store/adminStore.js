// frontend/src/store/adminStore.js (COMPLETO)

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

      // Acción para el login del administrador
      login: async (username, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login/admin', { username, password });
          set({
            admin: { username: data.username, role: data.role },
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          // Importante: Actualizamos el header de Axios al iniciar sesión
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Error al iniciar sesión.';
          set({ isLoading: false });
          return { success: false, message };
        }
      },

      // Acción para el logout
      logout: () => {
        set({ admin: null, token: null, isAuthenticated: false });
        // Limpiamos el header de Axios para no usar el token de admin en otras partes de la app
        delete api.defaults.headers.common['Authorization'];
      },
      
      // Función para verificar si el token actual sigue siendo válido al cargar la app
      // (No la usaremos aún, pero es buena práctica tenerla para el futuro)
      verifyToken: async () => {
        if (!get().token) {
          set({ isAuthenticated: false });
          return;
        }
        // Aquí podríamos añadir una llamada a un endpoint como /api/admin/verify para re-validar
        // Por ahora, si hay token, confiamos en él hasta que una llamada a la API falle.
      }
    }),
    {
      name: 'neuro-link-admin-storage', // Nombre único para el localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAdminStore;