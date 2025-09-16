// RUTA: frontend/src/store/userStore.js (VERSIÓN "NEXUS - STABILITY PATCH v1.0")
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
        // [MODIFICACIÓN INICIO] - Se limpia el estado de mantenimiento previo al inicio de la petición.
        // Esto asegura que si el modo mantenimiento se desactiva, el usuario pueda re-autenticarse.
        set({ isLoadingAuth: true, isMaintenanceMode: false }); 
        
        try {
          const hasToken = !!get().token;
          let response;

          if (hasToken) {
            response = await api.get('/auth/profile', { timeout: 15000 });
          } else {
            response = await api.post('/auth/sync', { telegramUser }, { timeout: 15000 });
          }
          
          const { user, settings, token } = response.data;
          
          set({ 
              user, 
              settings, 
              token: token || get().token,
              isAuthenticated: true, 
              isLoadingAuth: false,
              isMaintenanceMode: false, // Aseguramos que está en false en caso de éxito.
          });

        } catch (error) {
          console.error('[Store] Fallo en la sesión:', error.response?.data?.message || error.message);
          
          // [MODIFICACIÓN CRÍTICA] - Lógica de manejo de errores atómica y explícita.
          if (error.response?.status === 503) {
            // Transición específica al estado de MANTENIMIENTO.
            // No usamos ...initialState. Declaramos explícitamente la nueva forma del estado.
            set({
              isMaintenanceMode: true, // El flag importante.
              isAuthenticated: false,    // El acceso está denegado.
              user: null,                // No hay datos de usuario.
              token: null,               // El token (si lo hubiera) ya no es válido para acceder.
              isLoadingAuth: false,      // La carga ha finalizado.
            });
          } else {
            // Transición específica al estado de FALLO DE AUTENTICACIÓN GENÉRICO.
            // Limpiamos todo excepto el flag de mantenimiento.
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              isLoadingAuth: false,
              isMaintenanceMode: false,
            });
          }
          // [MODIFICACIÓN FIN]
        }
      },
      
      logout: () => {
        // La función de logout ahora es más simple, solo resetea a un estado inicial limpio.
        set({ ...initialState, isLoadingAuth: false });
      },
    }),
    {
      name: 'mega-fabrica-storage-v5',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
);

// El subscriber se mantiene igual, es correcto.
useUserStore.subscribe(
  (state) => state.token,
  (token) => {
    api.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : undefined;
  },
  { fireImmediately: true }
);

export default useUserStore;