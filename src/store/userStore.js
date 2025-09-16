// RUTA: frontend/src/store/userStore.js (VERSIÓN "NEXUS - RESILIENCY PATCH v1.1")
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

// [MODIFICACIÓN CRÍTICA] - Principio de Estado Resiliente
// Se define un objeto de usuario "vacío" pero con la estructura correcta.
// Esto evita que los componentes fallen al intentar acceder a propiedades como 'activeTools'.
const guestUser = {
  activeTools: [],
  referrals: [],
  // Añadir cualquier otra propiedad que sea un array o un objeto y que pueda ser accedida
  // por los componentes incluso antes de que el usuario esté completamente cargado.
  // Las propiedades simples (strings, numbers) pueden ser omitidas ya que `undefined` no causa crasheos al renderizar.
};

const initialState = {
  user: guestUser, // En lugar de 'null', usamos el objeto invitado.
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
              isMaintenanceMode: false,
          });

        } catch (error) {
          console.error('[Store] Fallo en la sesión:', error.response?.data?.message || error.message);
          
          if (error.response?.status === 503) {
            set({
              isMaintenanceMode: true,
              isAuthenticated: false,
              user: guestUser, // [MODIFICACIÓN] Usamos el objeto invitado
              token: null,
              isLoadingAuth: false,
            });
          } else {
            set({
              isAuthenticated: false,
              user: guestUser, // [MODIFICACIÓN] Usamos el objeto invitado
              token: null,
              isLoadingAuth: false,
              isMaintenanceMode: false,
            });
          }
        }
      },
      
      logout: () => {
        // La función de logout ahora resetea al estado inicial que ya es resiliente.
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