// RUTA: frontend/src/store/marketStore.js

import { create } from 'zustand';
import api from '@/api/axiosConfig';

const useMarketStore = create((set) => ({
  marketItems: [],
  isLoading: true,
  error: null,

  fetchMarketItems: async () => {
    set({ isLoading: true, error: null });
    try {
      // --- INICIO DE LA CORRECCIÓN CRÍTICA ---
      // El endpoint correcto, según la arquitectura del backend (investmentController), 
      // no es '/market/items', sino '/investments/items'.
      const response = await api.get('/investments/items');
      // --- FIN DE LA CORRECCIÓN CRÍTICA ---
      
      if (response.data && response.data.success) {
        set({
          marketItems: response.data.data,
          isLoading: false,
        });
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar los items del mercado.';
      console.error('[MarketStore] Fetch Error:', errorMessage);
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Futuras acciones como 'buyMarketItem', etc., se añadirán aquí.
}));

export default useMarketStore;