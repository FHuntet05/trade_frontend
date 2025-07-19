// frontend/src/store/userStore.js (VERSIÓN CORREGIDA FINAL v24.0)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

api.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[Axios Interceptor] Error 401. Deslogueando usuario.');
      const useUserStore = (await import('../store/userStore')).default;
      useUserStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoadingAuth: true,
      settings: null,

      // === LÓGICA DE SINCRONIZACIÓN RECONSTRUIDA ===
      syncUserWithBackend: async (telegramUser, refCode) => {
        set({ isLoadingAuth: true });
        try {
          // PASO 1: Validar/Crear usuario y obtener token
          const validateResponse = await api.post('/auth/validate', { user: telegramUser });
          const { token, user, settings, isNewUser } = validateResponse.data;
          
          // Actualizamos el estado inmediatamente con el token para la siguiente llamada
          set({ token, user, settings, isAuthenticated: true });

          // PASO 2: Si es un usuario nuevo y hay un código de referido, procesarlo.
          if (isNewUser && refCode) {
            console.log(`[Store] Usuario nuevo con referido. Procesando refCode: ${refCode}`);
            // La llamada a /referrals/process usará automáticamente el token que acabamos de guardar.
            const processResponse = await api.post('/referrals/process', { refCode });
            // Actualizamos el estado del usuario con la información del referente
            set({ user: processResponse.data });
          }

        } catch (error) {
          console.error('Error en el flujo de autenticación/referido:', error);
          set({ user: null, token: null, isAuthenticated: false });
        } finally {
          set({ isLoadingAuth: false });
        }
      },
      
      updateUser: (newUserObject) => set((state) => ({ ...state, user: newUserObject })),
      logout: () => set({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false }),
    }),
    {
      name: 'neuro-link-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
);
export default useUserStore;