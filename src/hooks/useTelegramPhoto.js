import { useEffect, useState } from "react";
import api from "@/api/axiosConfig";

const photoCache = new Map();
let cleanupRegistered = false;

const registerCacheCleanup = () => {
  if (cleanupRegistered) {
    return;
  }

  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("beforeunload", () => {
    photoCache.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        // ignore revoke errors
      }
    });
    photoCache.clear();
  });

  cleanupRegistered = true;
};

export const useTelegramPhoto = (telegramId, options = {}) => {
  // Activamos cacheBust por defecto para evitar caché de CDN cuando cambiamos headers en backend
  const { cacheBust = true, refreshKey } = options;
  const [state, setState] = useState({
    src: null,
    loading: Boolean(telegramId),
    error: null,
  });

  useEffect(() => {
    // Validar que telegramId sea válido (no vacío, no '---', debe ser numérico)
    if (!telegramId || telegramId === '---' || isNaN(telegramId)) {
      console.log('[useTelegramPhoto] TelegramId inválido:', telegramId);
      setState({ src: null, loading: false, error: null });
      return;
    }

    const cacheKey = `photo_${telegramId}`;

    if (!cacheBust && photoCache.has(cacheKey)) {
      console.log('[useTelegramPhoto] Foto encontrada en caché:', cacheKey);
      setState({ src: photoCache.get(cacheKey), loading: false, error: null });
      return;
    }

    let cancelled = false;

    const fetchPhoto = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        
  // Construir la URL completa para la foto con versión fija + bust opcional
  const baseUrl = `/user/photo/${telegramId}`;
  const VERSION = '2'; // incrementar si cambiamos headers/comportamiento del endpoint
  const params = [`v=${VERSION}`];
  if (cacheBust) params.push(`t=${Date.now()}`);
  const fullUrl = `${api.defaults.baseURL}${baseUrl}?${params.join('&')}`;
        
        console.log(`[useTelegramPhoto] Intentando cargar foto desde: ${fullUrl}`);

        if (cancelled) {
          return;
        }

        // Verificar que la imagen sea accesible creando un elemento Image
        const img = new Image();
        // No usar crossOrigin ya que el backend ya maneja CORS
        
        img.onload = () => {
          if (!cancelled) {
            console.log(`[useTelegramPhoto] ✅ Foto cargada exitosamente:`, fullUrl);
            if (!cacheBust) {
              photoCache.set(cacheKey, fullUrl);
              registerCacheCleanup();
            }
            setState({ src: fullUrl, loading: false, error: null });
          }
        };

        img.onerror = (error) => {
          if (!cancelled) {
            console.error(`[useTelegramPhoto] ❌ Error cargando imagen (404 o red error):`, fullUrl);
            // La imagen no existe o el servidor devolvió 404
            setState({ src: null, loading: false, error: new Error('Failed to load image') });
          }
        };

        img.src = fullUrl;

      } catch (error) {
        console.error('[useTelegramPhoto] Error en fetchPhoto:', error);
        if (!cancelled) {
          setState({ src: null, loading: false, error });
        }
      }
    };

    fetchPhoto();

    return () => {
      cancelled = true;
    };
  }, [telegramId, cacheBust, refreshKey]);

  return state;
};

export default useTelegramPhoto;
