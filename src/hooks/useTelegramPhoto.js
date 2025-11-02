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
    if (!telegramId) {
      setState({ src: null, loading: false, error: null });
      return;
    }

    const cacheKey = `photo_${telegramId}`;

    if (!cacheBust && photoCache.has(cacheKey)) {
      setState({ src: photoCache.get(cacheKey), loading: false, error: null });
      return;
    }

    let cancelled = false;

    const fetchPhoto = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        
        // Construir la URL con el parámetro de cache bust si es necesario
        const baseUrl = `/user/photo/${telegramId}`;
        const url = cacheBust ? `${baseUrl}?v=${Date.now()}` : baseUrl;
        
        // Usar la URL directamente ya que el backend hace redirect
        const photoUrl = `${api.defaults.baseURL}${url}`;

        if (cancelled) {
          return;
        }

        if (!cacheBust) {
          photoCache.set(cacheKey, photoUrl);
          registerCacheCleanup();
        }

        setState({ src: photoUrl, loading: false, error: null });
      } catch (error) {
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
