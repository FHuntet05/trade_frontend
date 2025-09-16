// RUTA: frontend/src/store/userStore.js (v3.2 - NEXUS RESILIENCY MERGE)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

// [PRINCIPIO DE ESTADO RESILIENTE] - Esencial para la estabilidad de la UI.
// Definimos un objeto de usuario "invitado" con una estructura válida pero vacía.
const guestUser = {
  activeTools: [],
  referrals: [],
  // Añadir aquí cualquier otra propiedad que sea un array o un objeto
  // para evitar errores 'TypeError: Cannot read properties of null'.
};

// [ESTADO INICIAL REFORZADO] - 'user' nunca es 'null'.
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
              isLoadingAuth: false,
              isAuthenticated: false,
              isMaintenanceMode: true,
              maintenanceMessage: error.response.data.maintenanceMessage || 'El sistema está en mantenimiento.',
              user: guestUser, // [CORRECCIÓN] Aseguramos un estado de usuario válido.
              token: null,     // [CORRECCIÓN] Limpiamos el token.
            });
          } else {
            // [CORRECCIÓN CRÍTICA] - Reemplazamos 'null' con 'guestUser'.
            set({ 
              user: guestUser, 
              token: null, 
              isAuthenticated: false, 
              isLoadingAuth: false,
              settings: null,
              isMaintenanceMode: false,
              maintenanceMessage: ''
            });
          }
        }
      },
      
      // Su nueva acción se mantiene, es correcta.
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
        // [CORRECCIÓN CRÍTICA] - Usamos el estado inicial resiliente para el logout.
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