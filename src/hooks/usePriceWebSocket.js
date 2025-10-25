// RUTA: frontend/src/hooks/usePriceWebSocket.js

import { useEffect, useRef } from 'react';
import { usePriceStore } from '@/store';

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'wss://trade-backend-roan.vercel.app/prices';

/**
 * Hook personalizado para gestionar la conexión WebSocket de precios en tiempo real.
 * Se conecta al servidor, escucha los eventos y actualiza el priceStore.
 * Incluye lógica de reconexión automática.
 */
export const usePriceWebSocket = () => {
  const setPrices = usePriceStore((state) => state.setPrices);
  const ws = useRef(null);

  useEffect(() => {
    const connect = () => {
      console.log('[WebSocket] Intentando conectar a:', WEBSOCKET_URL);
      ws.current = new WebSocket(WEBSOCKET_URL);

      ws.current.onopen = () => {
        console.log('[WebSocket] Conexión establecida con el servidor de precios.');
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'INITIAL_STATE' || message.type === 'PRICE_UPDATE') {
            // Usamos una acción 'setPrices' que actualiza el store de forma segura
            setPrices(message.data);
          } else if (message.data?.status === 'STALE') {
            console.warn('[WebSocket] El servidor reporta que los datos de precios están desactualizados.');
          }

        } catch (error) {
          console.error('[WebSocket] Error al procesar mensaje:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('[WebSocket] Error en la conexión:', error);
      };

      ws.current.onclose = () => {
        console.log('[WebSocket] Conexión cerrada. Intentando reconectar en 5 segundos...');
        // Limpiar la referencia antes de reintentar
        ws.current = null;
        setTimeout(connect, 5000); // Lógica de reconexión simple
      };
    };

    connect();

    // Función de limpieza para cerrar la conexión cuando el componente se desmonte
    return () => {
      if (ws.current) {
        ws.current.close();
        console.log('[WebSocket] Conexión cerrada limpiamente.');
      }
    };
  }, [setPrices]); // El efecto se ejecuta solo una vez, pero incluimos setPrices como dependencia.
};