import React from "react";
import useTelegramPhoto from "@/hooks/useTelegramPhoto";

const DEFAULT_FALLBACK = "https://i.postimg.cc/mD21B6r7/user-avatar-placeholder.png";

const TelegramAvatar = ({
  telegramId,
  photoUrl,
  alt = "Avatar",
  className = "",
  cacheBust = false,
  refreshKey,
  fallbackSrc = DEFAULT_FALLBACK,
  renderFallback,
  ...imgProps
}) => {
  const { src } = useTelegramPhoto(telegramId, { cacheBust, refreshKey });
  const resolvedSrc = photoUrl || src;

  if (resolvedSrc) {
    return <img src={resolvedSrc} alt={alt} className={className} {...imgProps} />;
  }

  if (typeof renderFallback === "function") {
    return renderFallback({ className, alt, cacheBust, refreshKey });
  }

  return <img src={fallbackSrc} alt={alt} className={className} {...imgProps} />;
};

export default TelegramAvatar;
