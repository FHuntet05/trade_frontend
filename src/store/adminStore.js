// RUTA: frontend/src/store/adminStore.js (VERSIÓN "NEXUS - HYDRATION AWARE")
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialState = {
  admin: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  _hasHydrated: false, // [NEXUS HYDRATION AWARE] Nuevo estado para rastrear la rehidratación.
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
        set({ ...initialState, _hasHydrated: true }); // Mantenemos el estado de hidratación
      },

      logout: () => {
        set({ ...initialState, _hasHydrated: true }); // Mantenemos el estado de hidratación
      },
      
      // [NEXUS HYDRATION AWARE] Nueva acción para ser llamada cuando la hidratación termina.
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: 'neuro-link-admin-storage',
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({ 
        token: state.token, 
        admin: state.admin, 
      }),
      
      // [NEXUS HYDRATION AWARE] Usamos la API onRehydrateStorage del middleware.
      // Se ejecuta una vez que los datos de localStorage se cargan en el store.
      onRehydrateStorage: () => (state) => {
        console.log('[adminStore] Rehidratación desde localStorage completada.');
        state.setHasHydrated(true);
      },
    }
  )
);

// Sincronización del estado de autenticación después de la rehidratación.
useAdminStore.subscribe((state) => {
  if (state._hasHydrated && state.token && !state.isAuthenticated) {
    useAdminStore.setState({ isAuthenticated: true });
  }
});

export default useAdminStore;