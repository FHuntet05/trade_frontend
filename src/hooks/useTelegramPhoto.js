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
  const { cacheBust = false, refreshKey } = options;
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
        
        // Construir la URL completa para la foto
        const baseUrl = `/user/photo/${telegramId}`;
        const url = cacheBust ? `${baseUrl}?v=${Date.now()}` : baseUrl;
        
        // La URL completa debe incluir el baseURL de la API
        const fullUrl = `${api.defaults.baseURL}${url}`;
        
        console.log(`[useTelegramPhoto] Cargando foto desde: ${fullUrl}`);

        if (cancelled) {
          return;
        }

        // No hacemos fetch aquí, simplemente usamos la URL directamente
        // El backend se encarga de servir la imagen o hacer redirect
        if (!cacheBust) {
          photoCache.set(cacheKey, fullUrl);
          registerCacheCleanup();
        }

        setState({ src: fullUrl, loading: false, error: null });
      } catch (error) {
        console.error('[useTelegramPhoto] Error:', error);
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
