// RUTA: frontend/src/store/adminStore.js (VERSIÓN "NEXUS - REHYDRATE FIX")
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialState = {
  admin: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

const useAdminStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      loginSuccess: (token, adminData) => {
        set({
          token: token,
          admin: adminData,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setLoading: (loadingState) => {
        set({ isLoading: loadingState });
      },
      
      loginFail: () => {
        set({
          token: null,
          admin: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      logout: () => {
        set(initialState);
      },
    }),
    {
      name: 'neuro-link-admin-storage',
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({ 
        token: state.token, 
        admin: state.admin, 
      }),
      
      // [NEXUS REHYDRATE FIX - CORRECCIÓN CRÍTICA]
      // Se elimina la sintaxis incorrecta 'onRehydrateStorage' del objeto de configuración.
      // La forma correcta de manejar la rehidratación se hace fuera de la creación del store.
    }
  )
);

// [NEXUS REHYDRATE FIX - IMPLEMENTACIÓN CORRECTA]
// Zustand permite escuchar cambios en el store. El middleware 'persist' tiene una propiedad
// 'hasHydrated' que nos dice si ya cargó los datos del localStorage.
// Creamos un listener que se ejecuta cada vez que el estado cambia.
useAdminStore.subscribe((state, prevState) => {
  // Verificamos si la rehidratación acaba de ocurrir y si el estado de autenticación cambió.
  const hasHydrated = useAdminStore.persist.hasHydrated();
  const wasAuthenticated = prevState.isAuthenticated;
  const isAuthenticated = !!state.token; // Derivamos el estado de autenticación directamente del token.

  // Si la rehidratación ha ocurrido y el estado de autenticación es diferente al anterior, lo sincronizamos.
  if (hasHydrated && isAuthenticated !== wasAuthenticated) {
    useAdminStore.setState({ isAuthenticated: isAuthenticated });
    if(isAuthenticated) {
      console.log('[adminStore] Estado rehidratado y sincronizado. Autenticado.');
    }
  }
});

// Forzamos una verificación inicial al cargar la aplicación.
// Esto asegura que si el usuario ya tenía datos en localStorage, el estado 'isAuthenticated' se establezca correctamente.
const initialSync = () => {
  const state = useAdminStore.getState();
  if (state.token && state.admin) {
    useAdminStore.setState({ isAuthenticated: true });
  }
};
initialSync();


export default useAdminStore;