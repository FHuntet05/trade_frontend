const getApiBaseUrl = () => {
  const rawBase = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000/api";
  return typeof rawBase === "string" ? rawBase.replace(/\/$/, "") : "";
};

export const getTelegramPhotoUrl = (telegramId, options = {}) => {
  if (!telegramId) {
    return "";
  }

  const { bustCache = false } = options;
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return "";
  }

  const cacheQuery = bustCache ? `?v=${Date.now()}` : "";
  return `${baseUrl}/user/photo/${telegramId}${cacheQuery}`;
};
