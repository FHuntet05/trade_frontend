// RUTA: frontend/src/store/userStore.js
// --- VERSIÓN ACTUALIZADA CON LA LÓGICA DEL BONO DIARIO ---

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
      
      // --- INICIO DE LA MODIFICACIÓN (Bono Diario) ---
      claimDailyBonus: async () => {
        try {
          const response = await api.post('/user/claim-bonus');
          const { withdrawableBalance, lastBonusClaimedAt } = response.data;

          set((state) => ({
            user: {
              ...state.user,
              withdrawableBalance,
              lastBonusClaimedAt,
            }
          }));
          
          return response.data; // Se devuelve la respuesta completa para el toast de éxito
        } catch (error) {
          // Si el error viene de la API, tendrá una estructura `response.data`.
          // Si no, es un error de red u otro problema.
          const errorMessage = error.response?.data?.message || 'No se pudo reclamar el bono.';
          throw new Error(errorMessage);
        }
      },
      // --- FIN DE LA MODIFICACIÓN (Bono Diario) ---

      /**
       * Refresca el perfil completo del usuario desde el backend
       * Incluye photoUrl y hasWithdrawalPassword
       */
      refreshUserProfile: async () => {
        try {
          const response = await api.get('/user/profile');
          const updatedUser = response.data;
          
          set((state) => ({
            user: {
              ...state.user,
              ...updatedUser
            }
          }));
          
          return updatedUser;
        } catch (error) {
          console.error('Error al refrescar perfil:', error);
          throw error;
        }
      },

      updateUser: (partialUser) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              ...partialUser,
              balance: partialUser.balance
                ? { ...state.user.balance, ...partialUser.balance }
                : state.user.balance,
            }
          };
        });
      },

      updateUserBalances: (newBalances) => {
        set((state) => {
          if (!state.user) return state;
          const updatedUser = JSON.parse(JSON.stringify(state.user));
          updatedUser.balance = updatedUser.balance || {};

          if (newBalances.spins !== undefined) {
            updatedUser.balance.spins = newBalances.spins;
          }
          if (newBalances.usdt !== undefined) {
            updatedUser.balance.usdt = newBalances.usdt;
          }
          if (newBalances.withdrawable !== undefined) {
            updatedUser.withdrawableBalance = newBalances.withdrawable;
          }

          return { user: updatedUser };
        });
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
      name: 'ai-brok-trade-pro-user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user, settings: state.settings }),
    }
  )
);

export default useUserStore;