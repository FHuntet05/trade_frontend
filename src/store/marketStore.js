// RUTA: src/store/marketStore.js
// --- INICIO DE LA IMPLEMENTACIÓN DEL STORE RESILIENTE ---

import create from 'zustand';
import api from '@/api/axiosConfig';

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos

const useMarketStore = create((set, get) => ({
  marketData: [],
  lastFetched: null,
  isLoading: false,

  // La acción que contiene toda la lógica de obtención y caché
  fetchMarketData: async () => {
    const { lastFetched, marketData } = get();
    const now = new Date();

    // 1. Si ya tenemos datos y no han pasado 5 minutos, no hacemos nada.
    if (lastFetched && now - lastFetched < CACHE_DURATION_MS) {
      console.log('[MarketStore] Usando datos de mercado cacheados.');
      return;
    }

    // Solo mostramos el spinner de carga si no tenemos datos previos (primera carga)
    if (marketData.length === 0) {
      set({ isLoading: true });
    }

    try {
      console.log('[MarketStore] Obteniendo nuevos datos de mercado desde la API...');
      const response = await api.get('/market/prices');
      const dataArray = Object.values(response.data);
      
      // 2. Éxito: Actualizamos los datos y el timestamp.
      set({
        marketData: dataArray,
        lastFetched: new Date(),
      });

    } catch (error) {
      // 3. CRÍTICO: Si la API falla, no hacemos nada con el estado de los datos.
      // La UI seguirá mostrando los datos cacheados. Solo lo registramos.
      console.error("Error al actualizar los datos del mercado. Se mantendrán los datos anteriores.", error);
    
    } finally {
      // Siempre nos aseguramos de que el estado de carga termine.
      set({ isLoading: false });
    }
  },
}));

export default useMarketStore;