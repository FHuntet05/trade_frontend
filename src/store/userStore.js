// frontend/src/store/userStore.js (VERSIÓN FINAL v32.0 - A VERIFICAR)

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
    (set) => ({
      // --- ESTADOS DEL STORE ---
      user: null, 
      token: null, 
      isAuthenticated: false, 
      isLoadingAuth: true, 
      settings: null,
      
      syncUserWithBackend: async (telegramUser) => {
        set({ isLoadingAuth: true });
        try {
          console.log('[Store] Enviando datos de usuario al backend para sincronizar...', telegramUser);
          const response = await api.post('/auth/sync', { 
            telegramUser,
            timestamp: Date.now(),
            platform: 'telegram_web_app'
          });
          const { token, user, settings } = response.data;
          
          if (!token || !user) {
            throw new Error('Respuesta inválida del servidor: faltan token o datos de usuario');
          }
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            settings, 
            isLoadingAuth: false 
          });
          
          console.log('[Store] Sincronización completada con éxito.');
          return true;
        } catch (error) {
          console.error('[Store] Error fatal al sincronizar usuario:', error);
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoadingAuth: false,
            error: error.message || 'Error de sincronización'
          });
          return false;
        }
      },

      updateUser: (newUserData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...newUserData } : newUserData,
        }));
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoadingAuth: false
        })
      }
    }),
    {
      name: 'neuro-link-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export default useUserStore;