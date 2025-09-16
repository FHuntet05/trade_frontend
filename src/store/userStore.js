// RUTA: frontend/src/store/userStore.js (VERSIÓN "NEXUS - HTTP METHOD FIX")
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const initialState = {
  user: null, 
  token: null, 
  settings: null,
  isAuthenticated: false, 
  isLoadingAuth: true,
  isMaintenanceMode: false,
};

const useUserStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      fetchUserSession: async (telegramUser) => {
        set({ isLoadingAuth: true });
        try {
          const hasToken = !!get().token;
          let response;

          // [NEXUS HTTP METHOD FIX] - CORRECCIÓN CRÍTICA
          if (hasToken) {
            // Si tenemos token, usamos GET para refrescar el perfil.
            response = await api.get('/auth/profile', { timeout: 15000 });
          } else {
            // Si no hay token, usamos POST para el primer login/sincronización.
            response = await api.post('/auth/sync', { telegramUser }, { timeout: 15000 });
          }
          
          const { user, settings, token } = response.data;
          
          set({ 
              user, 
              settings, 
              token: token || get().token,
              isAuthenticated: true, 
              isLoadingAuth: false,
              isMaintenanceMode: false,
          });

        } catch (error) {
          console.error('[Store] Fallo en la sesión:', error.response?.data?.message || error.message);
          if (error.response?.status === 503) {
            set({ ...initialState, isMaintenanceMode: true, isLoadingAuth: false });
          } else {
            set({ ...initialState, isLoadingAuth: false });
          }
        }
      },
      
      logout: () => {
        set({ ...initialState, isLoadingAuth: false });
      },
    }),
    {
      name: 'mega-fabrica-storage-v5', // Cambiado para forzar reinicio.
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