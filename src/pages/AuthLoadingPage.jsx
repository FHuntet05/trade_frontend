// RUTA: frontend/src/pages/AuthLoadingPage.jsx (NUEVO ARCHIVO)

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
        
        {/* Placeholder para el logo de la aplicación */}
        {/* Asegúrese de tener un logo en /assets/logo.png o actualice la ruta */}
        <motion.img 
            src="/assets/logo.png" 
            alt="BlockSphere Logo" 
            className="w-24 h-24"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
        />

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