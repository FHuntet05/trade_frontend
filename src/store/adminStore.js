// RUTA: frontend/src/store/adminStore.js (VERSIÓN "NEXUS - DATA TYPE FIX")
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialState = {
  admin: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  _hasHydrated: false,
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

      // [NEXUS DATA TYPE FIX] - Nueva función de verificación centralizada y blindada.
      isSuperAdmin: () => {
        const { admin } = get(); // Obtenemos el estado actual del store.
        const superAdminId = import.meta.env.VITE_SUPER_ADMIN_TELEGRAM_ID;

        // Herramienta de diagnóstico:
        if (admin?.telegramId) {
            console.log('--- DIAGNÓSTICO DE PERMISOS ---');
            console.log('Admin Telegram ID (del store):', admin.telegramId, `(Tipo: ${typeof admin.telegramId})`);
            console.log('Super Admin ID (del .env):', superAdminId, `(Tipo: ${typeof superAdminId})`);
            console.log('Comparación (String vs String):', String(admin.telegramId).trim() === String(superAdminId).trim());
            console.log('---------------------------------');
        }

        if (!admin || !admin.telegramId || !superAdminId) {
            return false;
        }
        
        // La comparación blindada:
        // 1. Convierte ambos valores a String para evitar errores de tipo.
        // 2. Usa .trim() para eliminar cualquier espacio en blanco accidental.
        return String(admin.telegramId).trim() === String(superAdminId).trim();
      }
    }),
    {
      name: 'neuro-link-admin-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        token: state.token, 
        admin: state.admin, 
      }),
      onRehydrateStorage: () => (state) => {
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