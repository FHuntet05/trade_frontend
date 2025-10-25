// RUTA: frontend/src/store/userStore.js

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null, 
      token: null, 
      isAuthenticated: false, 
      isLoadingAuth: true, 
      settings: null,
      error: null,
      
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
            error: errorMessage
          });
          return false;
        }
      },

      // --- INICIO DE LA NUEVA LÓGICA (Ruleta) ---
      /**
       * Acción para actualizar los saldos del usuario localmente en el store.
       * Será llamada por la página de la ruleta después de un giro exitoso.
       * @param {object} newBalances - Objeto con los nuevos saldos. Ej: { spins: 9, withdrawable: 10.1 }
       */
      updateUserBalances: (newBalances) => {
        set((state) => {
          if (!state.user) return state; // No hacer nada si no hay usuario

          // Crear un nuevo objeto de usuario para evitar mutaciones directas del estado
          const updatedUser = { ...state.user };

          // Actualizar saldo de giros
          if (newBalances.spins !== undefined) {
            updatedUser.balance.spins = newBalances.spins;
          }
          // Actualizar XP (ntx)
          if (newBalances.xp !== undefined) {
            updatedUser.balance.ntx = newBalances.xp;
          }
          // Actualizar saldo retirable
          if (newBalances.withdrawable !== undefined) {
            updatedUser.withdrawableBalance = newBalances.withdrawable;
          }

          return { user: updatedUser };
        });
      },
      // --- FIN DE LA NUEVA LÓGICA (Ruleta) ---

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
      name: 'ai-brok-trade-pro-user-storage',
      storage: createJSONStorage(() => localStorage),
      // Ahora el token y el usuario completo se persisten para una recarga más fluida
      partialize: (state) => ({ token: state.token, user: state.user, settings: state.settings }),
    }
  )
);

export default useUserStore;