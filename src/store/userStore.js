// frontend/src/store/userStore.js (VERSIÓN TRASPLANTE v26.0)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

// --- Interceptores (Se mantienen sin cambios) ---
api.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.log("[Interceptor 401] Desautenticando usuario.");
      // Importación dinámica para evitar el bucle de dependencia
      const useUserStore = (await import('./userStore')).default;
      useUserStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoadingAuth: true, // Inicia como true para mostrar el loader en HomePage
      settings: null,
      error: null, // Nuevo estado para manejar errores de sincronización

      syncUserWithBackend: async (telegramUser, refCode) => {
        // Aseguramos que el estado de carga esté activo durante la sincronización inicial
        if (!get().isLoadingAuth) {
            set({ isLoadingAuth: true });
        }
        set({ error: null });

        try {
          console.log('[v26.0 userStore] Sincronizando usuario con el backend...');
          const response = await api.post('/auth/sync', { telegramUser, refCode });
          const { token, user, settings } = response.data;
          
          set({ 
              user, 
              token, 
              settings, 
              isAuthenticated: true, 
              isLoadingAuth: false 
            });

        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Error de conexión con el servidor.';
          console.error('[v26.0 userStore] Error fatal al sincronizar usuario:', errorMessage);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoadingAuth: false,
            error: errorMessage, // Guardamos el mensaje de error
          });
        }
      },

      updateUser: (newUserData) => {
        set((state) => ({
          user: { ...state.user, ...newUserData }
        }));
      },

      logout: () => {
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoadingAuth: false,
            error: "Sesión cerrada o inválida."
        });
      },

    }),
    {
      name: 'neuro-link-storage',
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos el token para re-autenticación, el resto se obtiene en cada carga.
      partialize: (state) => ({ token: state.token }),
    }
  )
);
export default useUserStore;