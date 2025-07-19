// frontend/src/store/userStore.js (VERSIÓN CORREGIDA v24.0)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

// ======================= INICIO DE LA CORRECCIÓN ARQUITECTURAL =======================
// Configuración del interceptor de peticiones AQUÍ, después de que 'api' se haya importado.
// Esto rompe la dependencia circular. 'api' se crea sin conocer el 'store',
// y el 'store' configura 'api' una vez que existe.
api.interceptors.request.use(
  (config) => {
    // Obtenemos el token directamente del estado de zustand en cada petición.
    const token = useUserStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// ======================== FIN DE LA CORRECCIÓN ARQUITECTURAL =========================

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoadingAuth: true, // Empieza cargando por defecto
      settings: null,

      syncUserWithBackend: async (telegramUser, refCode) => {
        set({ isLoadingAuth: true }); // Asegurarse de mostrar el loader
        try {
          // La llamada a la API ahora usará automáticamente el interceptor si hay un token
          const response = await api.post('/auth/sync', { user: telegramUser, refCode });
          const { token, user, settings } = response.data;
          set({ user, token, isAuthenticated: true, settings, isLoadingAuth: false });
        } catch (error) {
          console.error('Error al sincronizar usuario:', error);
          set({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false });
      },
    }),
    {
      name: 'neuro-link-storage',
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos el token. El resto del estado se recupera al sincronizar.
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export default useUserStore;