// RUTA: frontend/src/pages/AuthLoadingPage.jsx (VERSIÓN "NEXUS - VISUAL IDENTITY UPDATE")

import React from 'react';
import { motion } from 'framer-motion';

const AuthLoadingPage = () => {
  return (
    <motion.div
      className="w-full h-screen flex items-center justify-center bg-dark-primary p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-xs bg-dark-secondary/70 backdrop-blur-lg rounded-2xl border border-white/10 p-8 flex flex-col items-center gap-6 shadow-xl">
        
        {/* [NEXUS VISUAL REFINEMENT] - INICIO DE LA CORRECCIÓN */}
        <motion.img 
            // Se actualiza la URL a la proporcionada.
            src="https://i.postimg.cc/XqqqFR0C/photo-2025-09-20-02-42-29.jpg" 
            alt="BlockSphere Logo" 
            // Se añaden clases para la forma circular y el ajuste de la imagen.
            className="w-24 h-24 rounded-full object-cover border-2 border-white/10"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
        />
        {/* [NEXUS VISUAL REFINEMENT] - FIN DE LA CORRECCIÓN */}

        <div>
          <h1 className="text-2xl font-bold text-center text-white">
            BlockSphere
          </h1>
          <p className="text-sm text-text-secondary text-center mt-2 animate-pulse">
            Sincronizando datos...
          </p>
        </div>

      </div>
    </motion.div>
  );
};

export default AuthLoadingPage;