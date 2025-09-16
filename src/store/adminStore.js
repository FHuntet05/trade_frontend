// RUTA: frontend/src/store/adminStore.js (VERSIÓN "NEXUS - GUARDIAN")
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialState = {
  admin: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  _hasHydrated: false, // Estado clave para rastrear la carga desde localStorage.
};

const useAdminStore = create(
  persist(
    (set) => ({
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
        set({ ...initialState, _hasHydrated: true });
      },

      logout: () => {
        set({ ...initialState, _hasHydrated: true });
      },
      
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
      
      onRehydrateStorage: () => (state) => {
        console.log('[adminStore] Rehidratación desde localStorage completada.');
        state.setHasHydrated(true);
      },
    }
  )
);

useAdminStore.subscribe((state) => {
  if (state._hasHydrated && state.token && !state.isAuthenticated) {
    useAdminStore.setState({ isAuthenticated: true });
  }
});

export default useAdminStore;