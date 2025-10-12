import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePriceStore = create(
  persist(
    (set, get) => ({
      prices: {},
      volumes: {},
      changes24h: {},
      lastUpdate: null,
      socket: null,
      isConnected: false,
      
      // Función para actualizar precios manualmente o desde WebSocket
      updatePrice: (symbol, data) => {
        const { prices, changes24h, volumes } = get();
        set({
          prices: { ...prices, [symbol]: data.price },
          changes24h: { ...changes24h, [symbol]: data.change24h },
          volumes: { ...volumes, [symbol]: data.volume },
          lastUpdate: Date.now()
        });
      },

      // Función para simular datos en tiempo real (cuando no hay API)
      simulateRealTimeData: () => {
        const symbols = ['BTC', 'ETH', 'USDT', 'BNB', 'ADA', 'DOT', 'XRP'];
        const { prices } = get();

        // Simular cambios realistas basados en el último precio
        symbols.forEach(symbol => {
          const currentPrice = prices[symbol] || getBasePrice(symbol);
          const change = (Math.random() - 0.5) * 0.001 * currentPrice; // ±0.1% cambio
          const newPrice = currentPrice + change;
          const volume = Math.random() * 1000000;
          const change24h = (Math.random() - 0.5) * 10; // ±5% cambio 24h

          get().updatePrice(symbol, {
            price: newPrice,
            volume,
            change24h
          });
        });
      },

      // Iniciar simulación
      startSimulation: () => {
        if (!get().isConnected) {
          const interval = setInterval(() => {
            get().simulateRealTimeData();
          }, 3000); // Actualizar cada 3 segundos
          
          set({ 
            isConnected: true,
            socket: interval
          });
        }
      },

      // Detener simulación
      stopSimulation: () => {
        const { socket } = get();
        if (socket) {
          clearInterval(socket);
          set({ 
            isConnected: false,
            socket: null
          });
        }
      },

      // Obtener datos históricos simulados
      getHistoricalData: (symbol, timeframe = '1d') => {
        const dataPoints = 100;
        const basePrice = getBasePrice(symbol);
        const data = [];
        let currentPrice = basePrice;

        for (let i = 0; i < dataPoints; i++) {
          const time = Date.now() - (dataPoints - i) * 86400000; // 1 día en ms
          const change = (Math.random() - 0.5) * 0.02 * currentPrice;
          currentPrice += change;
          
          data.push({
            time,
            price: currentPrice,
            volume: Math.random() * 1000000
          });
        }

        return data;
      }
    }),
    {
      name: 'price-store',
      partialize: (state) => ({ 
        prices: state.prices,
        lastUpdate: state.lastUpdate
      })
    }
  )
);

// Precios base para simulación
const getBasePrice = (symbol) => {
  const basePrices = {
    'BTC': 35000,
    'ETH': 2000,
    'USDT': 1,
    'BNB': 220,
    'ADA': 0.5,
    'DOT': 7,
    'XRP': 0.5
  };
  return basePrices[symbol] || 1;
};

export default usePriceStore;