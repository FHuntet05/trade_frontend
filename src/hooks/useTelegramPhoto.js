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

    if (!cacheBust && photoCache.has(telegramId)) {
      setState({ src: photoCache.get(telegramId), loading: false, error: null });
      return;
    }

    let cancelled = false;
    let objectUrl;

    const fetchPhoto = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await api.get(`/user/photo/${telegramId}`, {
          responseType: "blob",
          params: cacheBust ? { v: Date.now() } : undefined,
        });

        if (cancelled) {
          return;
        }

        objectUrl = URL.createObjectURL(response.data);

        if (!cacheBust) {
          photoCache.set(telegramId, objectUrl);
          registerCacheCleanup();
        }

        setState({ src: objectUrl, loading: false, error: null });
      } catch (error) {
        if (!cancelled) {
          setState({ src: null, loading: false, error });
        }
      }
    };

    fetchPhoto();

    return () => {
      cancelled = true;
      if (cacheBust && objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch (error) {
          // ignore revoke errors
        }
      }
    };
  }, [telegramId, cacheBust, refreshKey]);

  return state;
};

export default useTelegramPhoto;
