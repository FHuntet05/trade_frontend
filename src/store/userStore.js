// frontend/src/store/userStore.js (VERSIÓN PROTOCOLO CERO v29.0)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

// Interceptores (SIN CAMBIOS)
api.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const useUserStore = (await import('./userStore')).default;
      useUserStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoadingAuth: true,
      settings: null,
      error: null,
      
      // --- CERROJO DEL PROTOCOLO CERO ---
      isInitialized: false, // La bandera que previene la ejecución múltiple.

      // --- LA ÚNICA FUNCIÓN DE INICIALIZACIÓN ---
      initializeApp: () => {
        // 1. Si ya se ha inicializado, no hacer NADA. Esta es la clave.
        if (get().isInitialized) {
          return;
        }
        
        // 2. Marcar como inicializado INMEDIATAMENTE para cerrar el cerrojo.
        set({ isInitialized: true, isLoadingAuth: true });
        console.log('[PROTOCOLO CERO] Cerrojo activado. Iniciando sincronización por única vez.');

        const tg = window.Telegram?.WebApp;
        if (!tg || !tg.initDataUnsafe?.user?.id) {
          console.error('[PROTOCOLO CERO] Entorno Telegram no válido. Abortando.');
          set({ error: 'Entorno de Telegram no válido.', isLoadingAuth: false });
          return;
        }
        
        tg.ready();
        tg.expand();

        // 3. Leemos el dato de la única fuente fiable que nos queda.
        const telegramUser = tg.initDataUnsafe.user;
        const refCode = tg.initDataUnsafe.start_param || null;
        console.log(`[PROTOCOLO CERO] Datos de Telegram capturados. refCode: ${refCode}`);

        // 4. Se ejecuta la llamada a la API.
        api.post('/auth/sync', { telegramUser, refCode })
          .then(response => {
            const { token, user, settings } = response.data;
            set({ 
                user, 
                token, 
                settings, 
                isAuthenticated: true, 
                isLoadingAuth: false,
                error: null,
             });
            console.log('[PROTOCOLO CERO] Sincronización exitosa.');
          })
          .catch(error => {
            const errorMessage = error.response?.data?.message || 'Error de conexión con el servidor.';
            console.error('[PROTOCOLO CERO] FALLO en la sincronización:', errorMessage);
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoadingAuth: false,
                error: errorMessage,
            });
          });
      },

      // updateUser y logout se mantienen para la lógica de la app
      updateUser: (newUserData) => {
        set((state) => ({
          user: { ...state.user, ...newUserData }
        }));
      },

      logout: () => {
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoadingAuth: false,
            error: "Sesión cerrada o inválida.",
            isInitialized: true, // Se mantiene inicializado para no volver a intentar.
        });
      },
    }),
    {
      name: 'neuro-link-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
);
export default useUserStore;