// RUTA: frontend/src/store/userStore.js (v4.0 - NEXUS FINAL BUILD)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const guestUser = {
  activeTools: [],
  referrals: [],
};

const initialState = {
  user: guestUser,
  token: null,
  settings: null,
  isAuthenticated: false,
  isLoadingAuth: true,
  isMaintenanceMode: false,
  maintenanceMessage: '',
  isHydrated: false,
};

const useUserStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      syncUserWithBackend: async (telegramUser) => {
        if (!get().isLoadingAuth) {
            set({ isLoadingAuth: true });
        }
        try {
          const response = await api.post('/auth/sync', { telegramUser });
          const { token, user, settings } = response.data;
          
          set({ 
              user, 
              token, 
              isAuthenticated: true, 
              settings, 
              isLoadingAuth: false,
              isMaintenanceMode: false,
              maintenanceMessage: ''
          });

        } catch (error) {
          console.error('[Store] Error durante la sincronización:', error.response?.data?.message || error.message);
          
          if (error.response && error.response.status === 503) {
            set({
              ...initialState,
              isLoadingAuth: false,
              isMaintenanceMode: true,
              maintenanceMessage: error.response.data.maintenanceMessage || 'El sistema está en mantenimiento.',
            });
          } else {
            set({ 
              ...initialState,
              isLoadingAuth: false,
            });
          }
        }
      },
      
      refreshUserData: async () => {
        if (!get().isAuthenticated) return;
        try {
          const response = await api.get('/auth/profile'); 
          const { user: updatedUser, settings: updatedSettings } = response.data;
          set({ user: updatedUser, settings: updatedSettings });
          console.log('[Store] Datos de usuario refrescados en segundo plano.');
        } catch (error) {
          console.error('[Store] Fallo al refrescar los datos del usuario:', error.response?.data?.message || error.message);
        }
      },

      setUser: (newUserObject) => {
        set({ user: newUserObject });
      },
      
      logout: () => {
        set({ ...initialState, isLoadingAuth: false });
        console.log('[Store] Sesión cerrada.');
      },
      
      _setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: 'mega-fabrica-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
      // [ESTA ES LA LÍNEA QUE CORRIGE EL ERROR DE FORMA DEFINITIVA]
      onRehydrateStorage: (state) => {
        if (state) {
          state._setHydrated();
        }
      }
    }
  )
);

useUserStore.subscribe(
  (state) => state.token,
  (token) => {
    if (api.defaults.headers.common) {
        api.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';
    }
  }
);

export default useUserStore;