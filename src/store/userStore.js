// RUTA: frontend/src/store/userStore.js

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const useUserStore = create(
  persist(
    (set) => ({
      user: null, 
      token: null, 
      isAuthenticated: false, 
      isLoadingAuth: true, 
      settings: null,
      error: null, // <-- AÑADIMOS UN ESTADO PARA EL ERROR
      
      syncUserWithBackend: async (telegramUser) => {
        console.log('[Depuración] Iniciando syncUserWithBackend...');
        set({ isLoadingAuth: true, error: null });
        try {
          console.log('[Depuración] Datos de Telegram a enviar:', JSON.stringify(telegramUser));
          
          const response = await api.post('/auth/sync', { 
            telegramUser,
            timestamp: Date.now(),
            platform: 'telegram_web_app'
          });

          console.log('[Depuración] Respuesta RECIBIDA del backend:', JSON.stringify(response.data));
          
          const { token, user, settings } = response.data;
          
          if (!token || !user) {
            console.error('[Depuración] ERROR CRÍTICO: Token o User faltan en la respuesta.');
            throw new Error('Respuesta inválida del servidor: faltan token o datos de usuario');
          }
          
          console.log('[Depuración] Sincronización exitosa. Actualizando estado...');
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            settings, 
            isLoadingAuth: false 
          });
          console.log('[Depuración] Estado actualizado. El usuario debería ver la app.');
          return true;

        } catch (error) {
          console.error('[Depuración] ERROR CATASTRÓFICO en syncUserWithBackend:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Error desconocido durante la sincronización.';
          console.error('[Depuración] Mensaje de error a guardar:', errorMessage);
          
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoadingAuth: false,
            error: errorMessage // <-- GUARDAMOS EL MENSAJE DE ERROR
          });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoadingAuth: false,
          error: null,
        })
      }
    }),
    {
      name: 'ai-brok-trade-pro-user-storage', // Nombre actualizado para evitar conflictos de caché
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export default useUserStore;