import { create } from 'zustand';

const useIndicatorStore = create((set, get) => ({
  indicators: {},
  alerts: [],
  
  // Calcular RSI (Relative Strength Index)
  calculateRSI: (prices, period = 14) => {
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i < period + 1; i++) {
      const change = prices[i] - prices[i - 1];
      if (change >= 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    return 100 - (100 / (1 + avgGain / avgLoss));
  },

  // Calcular EMA (Exponential Moving Average)
  calculateEMA: (prices, period = 20) => {
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  },

  // Calcular MACD (Moving Average Convergence Divergence)
  calculateMACD: (prices) => {
    const ema12 = get().calculateEMA(prices, 12);
    const ema26 = get().calculateEMA(prices, 26);
    return ema12 - ema26;
  },

  // Actualizar todos los indicadores
  updateIndicators: (symbol, prices) => {
    const rsi = get().calculateRSI(prices);
    const macd = get().calculateMACD(prices);
    const ema20 = get().calculateEMA(prices, 20);
    const ema50 = get().calculateEMA(prices, 50);

    set(state => ({
      indicators: {
        ...state.indicators,
        [symbol]: {
          rsi,
          macd,
          ema20,
          ema50,
          timestamp: Date.now()
        }
      }
    }));

    // Verificar alertas
    get().checkAlerts(symbol, prices[prices.length - 1]);
  },

  // Configurar una nueva alerta
  setAlert: (alert) => {
    set(state => ({
      alerts: [...state.alerts, {
        ...alert,
        id: Date.now(),
        triggered: false
      }]
    }));
  },

  // Eliminar una alerta
  removeAlert: (alertId) => {
    set(state => ({
      alerts: state.alerts.filter(alert => alert.id !== alertId)
    }));
  },

  // Verificar alertas
  checkAlerts: (symbol, currentPrice) => {
    set(state => {
      const updatedAlerts = state.alerts.map(alert => {
        if (alert.symbol === symbol && !alert.triggered) {
          if (
            (alert.type === 'above' && currentPrice >= alert.price) ||
            (alert.type === 'below' && currentPrice <= alert.price)
          ) {
            // Notificar al usuario
            new Notification('Alerta de Precio', {
              body: `${symbol} ha alcanzado ${currentPrice}`,
              icon: '/crypto-icons/${symbol.toLowerCase()}.png'
            });
            return { ...alert, triggered: true };
          }
        }
        return alert;
      });

      return { alerts: updatedAlerts };
    });
  }
}));