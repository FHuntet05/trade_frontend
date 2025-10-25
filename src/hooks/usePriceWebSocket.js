// RUTA: frontend/src/hooks/usePriceWebSocket.js
// --- INICIO DE LA MODIFICACIÓN ESTRATÉGICA (WebSocket a HTTP Polling) ---

import { useEffect } from 'react';
import usePriceStore from '@/store/priceStore'; // Se mantiene para actualizar el estado
import api from '@/api/axiosConfig'; // Se importa el cliente de API configurado

// Se define el intervalo de actualización en milisegundos. 7 segundos es un buen balance
// entre reactividad y carga para el servidor.
const POLLING_INTERVAL = 7000; // 7 segundos

/**
 * Hook refactorizado para gestionar la actualización de precios en tiempo real.
 *
 * MOTIVO DEL CAMBIO: Las plataformas Serverless como Vercel no soportan conexiones
 * WebSocket persistentes, lo que causaba el ciclo infinito de errores de conexión.
 *
 * NUEVA LÓGICA (HTTP POLLING): Este hook ahora utiliza un intervalo para hacer
 * peticiones HTTP a la API del backend cada 7 segundos. Esto simula el flujo
 * en tiempo real de una manera estable y compatible con la infraestructura actual.
 */
export const usePriceWebSocket = () => {
  const { setPrices } = usePriceStore();

  useEffect(() => {
    let intervalId = null;

    // Función asíncrona para obtener y actualizar los precios.
    const fetchAndSetPrices = async () => {
      try {
        console.log('[Price Polling] Solicitando precios actualizados a la API...');
        // NOTA: Se asume que existe el endpoint GET /api/market/prices en el backend.
        // Este endpoint debe devolver un objeto similar a { BTC: 65000, ETH: 3100, ... }.
        const response = await api.get('/market/prices');
        
        if (response.data && response.status === 200) {
          // Se actualiza el store de Zustand con los nuevos precios.
          // Cualquier componente que use 'usePriceStore' reaccionará a este cambio.
          setPrices(response.data);
          console.log('[Price Polling] Precios actualizados en el store.');
        }

      } catch (error) {
        // Se maneja el error de forma silenciosa en la consola para no molestar al usuario,
        // ya que el sistema reintentará automáticamente en el próximo intervalo.
        console.error('[Price Polling] Error al obtener precios:', error.response?.data?.message || error.message);
      }
    };

    // 1. Ejecutar la función una vez de inmediato al montar el componente
    // para que el usuario no espere 7 segundos para la primera actualización.
    fetchAndSetPrices();

    // 2. Establecer el intervalo para que la función se ejecute periódicamente.
    intervalId = setInterval(fetchAndSetPrices, POLLING_INTERVAL);

    // 3. Función de limpieza: Es CRÍTICO limpiar el intervalo cuando el
    // componente se desmonte (ej. el usuario cierra la app) para evitar fugas de memoria.
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log('[Price Polling] Intervalo de actualización de precios detenido.');
      }
    };
  }, [setPrices]); // 'setPrices' es una dependencia estable, el efecto se ejecutará solo una vez.

  // Este hook no renderiza nada, su único propósito es ejecutar esta lógica de fondo.
  return null;
};

// --- FIN DE LA MODIFICACIÓN ESTRATÉGICA ---