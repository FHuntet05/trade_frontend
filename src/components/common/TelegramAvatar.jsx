import React, { useState } from "react";
import useTelegramPhoto from "@/hooks/useTelegramPhoto";

const DEFAULT_FALLBACK = "https://i.postimg.cc/mD21B6r7/user-avatar-placeholder.png";

const TelegramAvatar = ({
  telegramId,
  photoUrl, // Mantenemos la prop por compatibilidad pero la ignoramos
  alt = "Avatar",
  className = "",
  cacheBust = false,
  refreshKey,
  fallbackSrc = DEFAULT_FALLBACK,
  renderFallback,
  ...imgProps
}) => {
  const { src, loading, error } = useTelegramPhoto(telegramId, { cacheBust, refreshKey });
  const [imageError, setImageError] = useState(false);
  
  console.log('[TelegramAvatar]', { telegramId, src, loading, error, imageError });

  // Si está cargando, mostrar fallback temporalmente
  if (loading) {
    if (typeof renderFallback === "function") {
      return renderFallback({ className, alt, cacheBust, refreshKey });
    }
    return <img src={fallbackSrc} alt={alt} className={className} {...imgProps} />;
  }

  // Si hay error o la imagen falló al cargar, mostrar fallback
  if (error || imageError || !src) {
    if (typeof renderFallback === "function") {
      return renderFallback({ className, alt, cacheBust, refreshKey });
    }
    return <img src={fallbackSrc} alt={alt} className={className} {...imgProps} />;
  }

  // Mostrar la imagen con manejo de errores
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={(e) => {
        console.error('[TelegramAvatar] Error cargando imagen:', src);
        setImageError(true);
      }}
      {...imgProps} 
    />
  );
};

export default TelegramAvatar;
