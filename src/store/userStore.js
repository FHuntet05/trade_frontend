// RUTA: frontend/src/store/userStore.js (VERSIÓN "NEXUS - FINAL SIMPLIFIED")
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const initialState = {
  user: null, 
  token: null, 
  settings: null,
  isAuthenticated: false, 
  isLoadingAuth: true, // Siempre comienza cargando.
  isMaintenanceMode: false,
};

const useUserStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Acción principal para obtener o actualizar los datos del usuario.
      fetchUserSession: async (telegramUser) => {
        set({ isLoadingAuth: true });
        try {
          // Si tenemos un token, usamos /auth/profile para una sincronización más ligera.
          // Si no, usamos /auth/sync para crear/loguear al usuario.
          const hasToken = !!get().token;
          const endpoint = hasToken ? '/auth/profile' : '/auth/sync';
          const payload = hasToken ? {} : { telegramUser };
          
          const response = await api.post(endpoint, payload, { timeout: 15000 });
          const { user, settings, token } = response.data;
          
          set({ 
              user, 
              settings, 
              token: token || get().token, // Usar el nuevo token si existe, si no, mantener el antiguo.
              isAuthenticated: true, 
              isLoadingAuth: false,
              isMaintenanceMode: false,
          });

        } catch (error) {
          console.error('[Store] Fallo en la sesión:', error.response?.data?.message || error.message);
          if (error.response?.status === 503) {
            set({ ...initialState, isMaintenanceMode: true, isLoadingAuth: false });
          } else {
            // Cualquier otro error (401, timeout, etc.) resulta en un deslogueo completo.
            set({ ...initialState, isLoadingAuth: false });
          }
        }
      },
      
      logout: () => {
        set({ ...initialState, isLoadingAuth: false });
      },
    }),
    {
      name: 'mega-fabrica-storage-v4', // Cambiado para forzar reinicio.
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
);

useUserStore.subscribe(
  (state) => state.token,
  (token) => {
    api.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : undefined;
  },
  { fireImmediately: true }
);

export default useUserStore;