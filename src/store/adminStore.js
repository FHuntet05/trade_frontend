// RUTA: frontend/src/store/adminStore.js
// --- VERSIÓN RECONSTRUIDA CON LÓGICA DE DATOS DEL DASHBOARD ---
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import adminApi from '@/pages/admin/api/adminApi'; // Importamos la instancia de Axios

const initialState = {
  admin: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  // --- NUEVO ESTADO PARA EL DASHBOARD ---
  dashboardStats: {
    totalUsers: 0,
    totalDepositVolume: 0,
    pendingWithdrawals: 0,
    centralWalletBalances: { usdt: 0, bnb: 0 },
    userGrowthData: [],
    recentUsers: [],
  },
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
        set({ _hasHydrated: state });
      },

      // --- NUEVA ACCIÓN PARA CARGAR DATOS DEL DASHBOARD ---
      fetchDashboardStats: async () => {
        set({ isLoading: true });
        try {
          // Usamos el endpoint correcto definido en el memo inicial
          const response = await adminApi.get('/admin/dashboard-stats'); 
          set({
            dashboardStats: response.data,
            isLoading: false,
          });
          return response.data; // Devuelve los datos para uso opcional en el componente
        } catch (error) {
          console.error("Error al cargar las estadísticas del dashboard:", error);
          set({ isLoading: false });
          // Devolvemos el error para que el componente pueda mostrar un toast
          throw error; 
        }
      },

      isSuperAdmin: () => {
        // ... (esta función se mantiene sin cambios)
        const { admin } = get();
        const superAdminId = import.meta.env.VITE_SUPER_ADMIN_TELEGRAM_ID;
        if (!admin || !admin.telegramId || !superAdminId) return false;
        return String(admin.telegramId).trim() === String(superAdminId).trim();
      }
    }),
    {
      name: 'neuro-link-admin-storage', // Puedes cambiarle el nombre si quieres
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, admin: state.admin }),
      onRehydrateStorage: () => (state) => { state.setHasHydrated(true); },
    }
  )
);

useAdminStore.subscribe((state) => {
  if (state._hasHydrated && state.token && !state.isAuthenticated) {
    useAdminStore.setState({ isAuthenticated: true });
  }
});

export default useAdminStore;