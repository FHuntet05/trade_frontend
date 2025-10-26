// RUTA: src/store/marketStore.js
// --- VERSIÓN MEJORADA CON MANEJO DE ESTADO DE ERROR ---

import create from 'zustand';
import api from '@/api/axiosConfig';

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos

const useMarketStore = create((set, get) => ({
  marketData: [],
  lastFetched: null,
  isLoading: true, // Inicia en true para la carga inicial
  error: null,     // Nuevo estado para el mensaje de error

  fetchMarketData: async () => {
    const { lastFetched } = get();
    const now = new Date();

    if (lastFetched && now - lastFetched < CACHE_DURATION_MS) {
      set({ isLoading: false }); // Si usamos caché, la carga termina
      return;
    }

    set({ isLoading: true, error: null }); // Inicia una nueva petición

    try {
      const response = await api.get('/market/prices'); // Usamos la ruta de precios que devuelve los paquetes
      
      set({
        marketData: response.data, // Asumimos que la API devuelve un array directamente
        lastFetched: new Date(),
        isLoading: false,
      });

    } catch (err) {
      const errorMessage = err.response?.data?.message || "El servicio no está disponible en este momento.";
      console.error("Error al actualizar los datos del mercado. Se mantendrán los datos anteriores.", err);
      
      // CRÍTICO: Se establece el estado de error
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
  },
}));

export default useMarketStore;