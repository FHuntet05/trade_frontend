// RUTA: src/store/priceStore.js

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// --- INICIO DE LA CORRECCIÓN CRÍTICA ---
// Se elimina la lógica de caché y fetch a la API REST.
// El store ahora actúa como un simple contenedor de estado que es actualizado
// por el hook de WebSocket.
// --- FIN DE LA CORRECCIÓN CRÍTICA ---

const usePriceStore = create(
  persist(
    (set, get) => ({
      prices: {
        // Inicializamos con valores por defecto para evitar errores de renderizado
        BTC: 0,
        ETH: 0,
        BNB: 0,
        SOL: 0,
        USDT: 1.0,
      },
      
      // --- INICIO DE LA NUEVA LÓGICA ---
      /**
       * Acción para actualizar los precios en el store.
       * Combina los precios existentes con los nuevos recibidos del WebSocket.
       * @param {object} newPrices - Un objeto con los nuevos precios, ej: { BTC: 65000, ETH: 3000 }
       */
      setPrices: (newPrices) => {
        set((state) => ({
          prices: { ...state.prices, ...newPrices }
        }));
      },
      // --- FIN DE LA NUEVA LÓGICA ---

      // La función fetchPrices y los estados lastUpdate/isLoading se eliminan por ser obsoletos.
    }),
    {
      name: 'ai-brok-trade-pro-price-storage',
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos los precios para que el usuario vea los últimos valores
      // conocidos al recargar la app, antes de que el WebSocket conecte.
      partialize: (state) => ({
        prices: state.prices,
      }),
    }
  )
);

export default usePriceStore;