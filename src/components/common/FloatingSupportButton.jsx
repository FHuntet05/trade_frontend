// RUTA: frontend/src/components/common/FloatingSupportButton.jsx (VERSIÓN "NEXUS - GLOBAL STYLE SYNC")
import React from 'react';
import { motion } from 'framer-motion';
import { HiChatBubbleLeftRight } from 'react-icons/hi2';

const FloatingSupportButton = ({ dragRef }) => {
  // --- REEMPLAZA ESTO CON TU ENLACE DE SOPORTE REAL ---
  const supportLink = 'https://t.me/AiBrokTradeProsvi';

  const handleSupportClick = () => {
    try {
      window.Telegram.WebApp.openTelegramLink(supportLink);
    } catch (error) {
      console.warn("Telegram WebApp API no disponible. Abriendo en nueva pestaña.");
      window.open(supportLink, '_blank');
    }
  };

  return (
    <motion.div
      drag
      dragConstraints={dragRef} // Limita el arrastre al contenedor padre
      dragMomentum={false} // Evita que el botón se deslice después de soltarlo
      onTap={handleSupportClick}
      className="fixed bottom-24 right-4 z-50 cursor-pointer"
      initial={{ scale: 0, y: 100 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.5 }}
      whileTap={{ scale: 0.9 }}
    >
      {/* [NEXUS STYLE SYNC] - Se reemplaza el gradiente y se actualiza la sombra */}
      <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/50">
        <HiChatBubbleLeftRight className="w-8 h-8 text-white" />
      </div>
    </motion.div>
  );
};

export default FloatingSupportButton;