// RUTA: src/store/marketStore.js
// --- VERSIÓN CORREGIDA CON TRANSFORMACIÓN DE DATOS ---

import create from 'zustand';
import api from '@/api/axiosConfig';

const CACHE_DURATION_MS = 5 * 60 * 1000;

const useMarketStore = create((set, get) => ({
  marketData: [], // El estado siempre será un array
  lastFetched: null,
  isLoading: true,
  error: null,

  fetchMarketData: async () => {
    const { lastFetched } = get();
    const now = new Date();

    if (lastFetched && now - lastFetched < CACHE_DURATION_MS) {
      set({ isLoading: false });
      return;
    }

    // El error no se resetea aquí para que persista si la API sigue fallando
    set({ isLoading: true });

    try {
      const response = await api.get('/market/prices');
      
      // 1. CORRECCIÓN CRÍTICA: Se transforma el objeto de la API en un array.
      const dataArray = Object.values(response.data);
      
      set({
        marketData: dataArray, // Se guarda el array
        lastFetched: new Date(),
        isLoading: false,
        error: null, // Se limpia el error en una petición exitosa
      });

    } catch (err) {
      const errorMessage = err.response?.data?.message || "El servicio no está disponible.";
      console.error("Error al actualizar los datos del mercado. Se mantendrán los datos anteriores.", err);
      
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
  },
}));

export default useMarketStore;