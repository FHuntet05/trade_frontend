// frontend/src/store/adminStore.js (CON FUNCIÓN PARA RESETEO DE PASSWORD)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// Ya no necesitamos el api de aquí, las llamadas se harán desde los componentes.

const useAdminStore = create(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // --- INICIO DE LA MODIFICACIÓN ---
      setAdminAndToken: (token, adminData) => {
        set({
          token: token,
          admin: adminData,
          isAuthenticated: true,
          isLoading: false,
        });
      },
      // --- FIN DE LA MODIFICACIÓN ---

      login: async (username, password, api) => { // Pasamos `adminApi` como argumento
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login/admin', { username, password });
          if (data.passwordResetRequired) {
             // Guardamos el token temporal para el reseteo
             set({ token: data.token, isLoading: false });
             return { success: true, passwordResetRequired: true };
          }
          if (data.twoFactorRequired) {
            set({ isLoading: false });
            return { success: true, twoFactorRequired: true, userId: data.userId };
          }
          set({
            admin: data.admin,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Error al iniciar sesión.';
          set({ isLoading: false, token: null });
          return { success: false, message };
        }
      },

      completeTwoFactorLogin: async (userId, token2fa, api) => { // Pasamos `adminApi` como argumento
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/2fa/verify-login', { userId, token: token2fa });
          set({
            admin: data.admin,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Error al verificar el token.';
          set({ isLoading: false });
          return { success: false, message };
        }
      },

      logout: () => {
        set({ admin: null, token: null, isAuthenticated: false });
      },
      
      // ...el resto de funciones como setTwoFactorEnabled se mantienen...
    }),
    {
      name: 'neuro-link-admin-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        token: state.token, 
        admin: state.admin, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAdminStore;