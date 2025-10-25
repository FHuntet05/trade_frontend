// RUTA: frontend/src/hooks/usePriceWebSocket.js

import { useEffect } from 'react';
import usePriceStore from '@/store/priceStore';
import api from '@/api/axiosConfig';

const POLLING_INTERVAL = 7000; // 7 segundos

export const usePriceWebSocket = () => {
  const { setPrices } = usePriceStore();

  useEffect(() => {
    let intervalId = null;

    const fetchAndSetPrices = async () => {
      try {
        console.log('[Price Polling] Solicitando precios...');
        // --- INICIO DE LA CORRECCIÓN CRÍTICA ---
        // La ruta correcta debe incluir el prefijo '/market' que definimos en el backend.
        const response = await api.get('/market/prices');
        // --- FIN DE LA CORRECCIÓN CRÍTICA ---
        
        if (response.data && response.status === 200) {
          setPrices(response.data);
        }

      } catch (error) {
        console.error('[Price Polling] Error al obtener precios:', error.response?.data?.message || error.message);
      }
    };

    fetchAndSetPrices();
    intervalId = setInterval(fetchAndSetPrices, POLLING_INTERVAL);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [setPrices]);

  return null;
};