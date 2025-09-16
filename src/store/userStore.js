// RUTA: frontend/src/store/userStore.js (VERSIÓN "NEXUS - FINAL STABLE")
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

// Estado inicial claro y predecible.
const initialState = {
  user: null, 
  token: null, 
  settings: null,
  isAuthenticated: false, 
  isLoadingAuth: true, // Siempre comienza cargando hasta que se resuelva la sesión.
  isMaintenanceMode: false,
  maintenanceMessage: '',
};

const useUserStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      syncUserWithBackend: async (telegramUser) => {
        // Nos aseguramos de que el estado de carga esté activo.
        if (!get().isLoadingAuth) set({ isLoadingAuth: true });
        
        try {
          const response = await api.post('/auth/sync', { telegramUser }, { timeout: 15000 });
          const { token, user, settings } = response.data;
          
          set({ 
              user, 
              token, 
              settings, 
              isAuthenticated: true, 
              isMaintenanceMode: false,
          });
        } catch (error) {
          console.error('[Store] Error en syncUser:', error.response?.data?.message || error.message);
          
          if (error.response?.status === 503) {
            set({
              ...initialState, // Resetea todo
              isMaintenanceMode: true,
              maintenanceMessage: error.response.data.message || 'En mantenimiento.',
            });
          } else {
            // Cualquier otro error (timeout, 401, etc.) resulta en un estado de deslogueo.
            set({ ...initialState });
          }
        } finally {
          // Bloque CRÍTICO: Garantiza que el estado de carga SIEMPRE se desactive.
          set({ isLoadingAuth: false });
        }
      },
      
      refreshUserData: async () => { /* ... (sin cambios) ... */ },
      setUser: (newUserObject) => set({ user: newUserObject }),
      
      logout: () => {
        set({ ...initialState, isLoadingAuth: false });
      },
    }),
    {
      name: 'mega-fabrica-storage-v3', // Se cambia el nombre para forzar una reinicialización del storage.
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos el token. El resto de datos se obtienen al sincronizar.
      // Esto previene tener datos de usuario desactualizados en el storage.
      partialize: (state) => ({ token: state.token }),
    }
  )
);

// Sincronización del token con las cabeceras de Axios.
useUserStore.subscribe(
  (state) => state.token,
  (token) => {
    api.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : undefined;
  },
  { fireImmediately: true } // Se ejecuta inmediatamente al cargar la app.
);

export default useUserStore;