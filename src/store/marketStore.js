// RUTA: src/store/marketStore.js
// --- VERSIÓN CORREGIDA CON TRANSFORMACIÓN DE DATOS ---

import create from 'zustand';
import api from '@/api/axiosConfig';

const DEFAULT_MARKET_SKELETON = [
  { symbol: 'BTC', name: 'Bitcoin', price: 0, change: 0, image: '/assets/images/BTC.png' },
  { symbol: 'ETH', name: 'Ethereum', price: 0, change: 0, image: '/assets/images/ETH.png' },
  { symbol: 'BNB', name: 'BNB', price: 0, change: 0, image: '/assets/images/BNB.png' },
  { symbol: 'SOL', name: 'Solana', price: 0, change: 0, image: '/assets/images/SOL.png' },
  { symbol: 'USDT', name: 'Tether', price: 1, change: 0, image: '/assets/images/USDT.png' },
  { symbol: 'TON', name: 'Toncoin', price: 0, change: 0, image: '/assets/images/TON.png' },
  { symbol: 'LTC', name: 'Litecoin', price: 0, change: 0, image: '/assets/images/litecoin.png' },
  { symbol: 'TRX', name: 'TRON', price: 0, change: 0, image: '/assets/images/TRON.png' },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0, change: 0, image: '/assets/images/DOG.png' },
];

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

      const rawData = response.data || {};
      const dataArray = Object.values(rawData).map((entry) => ({
        ...entry,
        symbol: typeof entry.symbol === 'string' ? entry.symbol.toUpperCase() : entry.symbol,
      }));

      const mergedData = DEFAULT_MARKET_SKELETON.map((fallback) => {
        const match = dataArray.find((item) => (item.symbol || '').toUpperCase() === fallback.symbol);
        return match ? { ...fallback, ...match } : fallback;
      });

      set({
        marketData: mergedData,
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