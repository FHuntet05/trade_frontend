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
        set({ isLoadingAuth: true, error: null });
        try {
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
          return true;

        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Error desconocido durante la sincronización.';
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

      // --- INICIO DE LA LÓGICA CRÍTICA PARA LA RULETA ---
      /**
       * Acción para actualizar los saldos del usuario de forma centralizada.
       * Esta función es llamada por 'WheelPage' después de una respuesta exitosa de la API.
       * Actualiza el estado de manera inmutable para asegurar la reactividad.
       * @param {object} newBalances - Objeto con los nuevos saldos. Ej: { spins: 9, withdrawable: 10.1, xp: 500 }
       */
      updateUserBalances: (newBalances) => {
        set((state) => {
          // Si no hay un usuario logueado, no se hace nada para prevenir errores.
          if (!state.user) return state;

          // Se crea una copia profunda del usuario para evitar mutaciones directas del estado.
          // Esto es una buena práctica en Zustand y React.
          const updatedUser = JSON.parse(JSON.stringify(state.user));

          // Se actualiza el saldo de giros si viene en la respuesta.
          if (newBalances.spins !== undefined) {
            updatedUser.balance.spins = newBalances.spins;
          }
          // Se actualiza el XP (ntx) si viene en la respuesta.
          if (newBalances.xp !== undefined) {
            updatedUser.balance.ntx = newBalances.xp;
          }
          // Se actualiza el saldo retirable si viene en la respuesta.
          if (newBalances.withdrawable !== undefined) {
            updatedUser.withdrawableBalance = newBalances.withdrawable;
          }

          // Se devuelve el nuevo estado con el objeto de usuario actualizado.
          return { user: updatedUser };
        });
      },
      // --- FIN DE LA LÓGICA CRÍTICA PARA LA RULETA ---

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
      partialize: (state) => ({ token: state.token, user: state.user, settings: state.settings }),
    }
  )
);

export default useUserStore;