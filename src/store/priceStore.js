// RUTA: src/store/priceStore.js

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/api/axiosConfig';

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutos en milisegundos

const usePriceStore = create(
  persist(
    (set, get) => ({
      prices: {},
      lastUpdate: null,
      isLoading: false,

      fetchPrices: async () => {
        const now = Date.now();
        const lastUpdate = get().lastUpdate;
        const isLoading = get().isLoading;

        if (isLoading || (lastUpdate && (now - lastUpdate < CACHE_DURATION))) {
          return;
        }

        set({ isLoading: true });

        try {
          const response = await api.get('/prices'); // Endpoint que crearemos en el backend
          if (response.data && response.data.success) {
            
            const newPrices = response.data.data.reduce((acc, crypto) => {
              acc[crypto.ticker] = crypto.priceUsd;
              return acc;
            }, {});

            set({
              prices: newPrices,
              lastUpdate: Date.now(),
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Error fetching crypto prices:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'ai-brok-trade-pro-price-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        prices: state.prices,
        lastUpdate: state.lastUpdate,
      }),
    }
  )
);

export default usePriceStore;