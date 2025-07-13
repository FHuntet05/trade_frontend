// --- START OF FILE src/utils/haptics.js ---

/**
 * Proporciona una forma segura de invocar el feedback háptico (vibración)
 * de la API de Telegram Web App.
 */

// Dispara una vibración de impacto. Ligera y rápida.
// Ideal para clics de botones, toggles, switches.
export const triggerImpactHaptic = (style = 'light') => {
  if (window.Telegram?.WebApp?.HapticFeedback) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred(style); // 'light', 'medium', 'heavy', 'rigid', 'soft'
  }
};

// Dispara una vibración de notificación.
// Ideal para indicar éxito (success) o error (error).
export const triggerNotificationHaptic = (type = 'success') => {
  if (window.Telegram?.WebApp?.HapticFeedback) {
    window.Telegram.WebApp.HapticFeedback.notificationOccurred(type); // 'success', 'warning', 'error'
  }
};

// --- END OF FILE src/utils/haptics.js ---