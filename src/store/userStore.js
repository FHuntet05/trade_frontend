// RUTA: frontend/src/store/userStore.js (VERSIÓN "NEXUS - DIRECT FIX")

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const initialState = {
  user: null, 
  token: null, 
  settings: null,
  isAuthenticated: false, 
  isLoadingAuth: true, // Siempre empieza en true.
  isMaintenanceMode: false,
  maintenanceMessage: '',
};

const useUserStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      syncUserWithBackend: async (telegramUser) => {
        // Asegura que siempre empecemos desde un estado de carga.
        set({ isLoadingAuth: true });
        
        try {
          const response = await api.post('/auth/sync', { telegramUser }, { timeout: 15000 });
          const { token, user, settings } = response.data;
          
          set({ 
              user, 
              token, 
              settings, 
              isAuthenticated: true, 
              isMaintenanceMode: false,
              isLoadingAuth: false, // <-- Se establece en false tras el éxito.
          });
          return { success: true };

        } catch (error) {
          console.error('[Store] Error fatal durante la sincronización:', error.response?.data?.message || error.message);
          
          if (error.response?.status === 503) {
            set({
              ...initialState, // Resetea todo
              isMaintenanceMode: true,
              maintenanceMessage: error.response.data.message || 'En mantenimiento.',
              isLoadingAuth: false, // <-- Se establece en false tras el fallo.
            });
          } else {
             set({ 
              ...initialState, // Resetea todo
              isLoadingAuth: false, // <-- Se establece en false tras el fallo.
            });
          }
          return { success: false, error: error.response?.data?.message || error.message };
        }
      },
      
      refreshUserData: async () => { /* ... (sin cambios) ... */ },
      setUser: (newUserObject) => set({ user: newUserObject }),
      
      logout: () => {
        set({ ...initialState, isLoadingAuth: false });
      },
    }),
    {
      name: 'mega-fabrica-storage-v2', // Cambiado para forzar una reinicialización del storage.
      storage: createJSONStorage(() => localStorage),
      // Simplificamos: solo persistimos el token. El resto se obtendrá al sincronizar.
      partialize: (state) => ({ token: state.token }),
    }
  )
);


// Inyectamos el token en las cabeceras de Axios cada vez que cambie.
const unsub = useUserStore.subscribe(
  (state) => state.token,
  (token) => {
    api.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : undefined;
  },
  { fireImmediately: true }
);

export default useUserStore;