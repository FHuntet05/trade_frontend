// RUTA: frontend/src/store/userStore.js (VERSIÓN "NEXUS - TIMEOUT FIX")

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null, 
      token: null, 
      settings: null,
      isAuthenticated: false, 
      isLoadingAuth: true, // Debe ser true inicialmente
      isMaintenanceMode: false,
      maintenanceMessage: '',
      isHydrated: false,

      syncUserWithBackend: async (telegramUser) => {
        // Aseguramos que el estado de carga esté activo al inicio.
        if (!get().isLoadingAuth) {
            set({ isLoadingAuth: true });
        }
        
        try {
          // [NEXUS FIX] Se añade un timeout de 10 segundos para forzar la resolución o el error.
          const response = await api.post('/auth/sync', { telegramUser }, { timeout: 10000 }); 
          const { token, user, settings } = response.data;
          
          set({ 
              user, 
              token, 
              isAuthenticated: true, 
              settings, 
              // El cleanup a isLoadingAuth: false se hará en el bloque finally.
              isMaintenanceMode: false,
              maintenanceMessage: ''
          });

        } catch (error) {
          console.error('[Store] Error durante la sincronización:', error.response?.data?.message || error.message);
          
          // Lógica de Mantenimiento
          if (error.response && error.response.status === 503) {
            set({
              isAuthenticated: false,
              isMaintenanceMode: true,
              maintenanceMessage: error.response.data.maintenanceMessage || 'El sistema está en mantenimiento.'
            });
          } else {
            // Cualquier otro error de autenticación/red.
            set({ 
              user: null, 
              token: null, 
              isAuthenticated: false, 
              settings: null,
              isMaintenanceMode: false,
              maintenanceMessage: ''
            });
          }
        } finally {
            // [NEXUS FIX - CRÍTICO] Garantizamos que isLoadingAuth siempre se desactive,
            // sin importar si la promesa fue exitosa, falló, o se colgó (timeout).
            set({ isLoadingAuth: false }); 
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
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoadingAuth: false,
          settings: null,
          isMaintenanceMode: false,
          maintenanceMessage: ''
        });
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
      onRehydrateStorage: () => (state) => {
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