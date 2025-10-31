// RUTA: src/components/AnimatedLoadingScreen.jsx (NUEVO ARCHIVO)

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AnimatedLoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  // Simula un progreso de carga para una mejor experiencia visual.
  // La pantalla se mostrará hasta que la autenticación real finalice.
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 99) {
          clearInterval(timer);
          return 99; // Se detiene en 99% para dar la sensación de "casi listo"
        }
        // Simula una carga más lenta al principio y más rápida al final
        const increment = Math.random() * 10;
        return Math.min(prevProgress + increment, 99);
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-dark-primary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-xs bg-dark-secondary rounded-2xl shadow-lg p-8 flex flex-col items-center"
      >
        {/* Logo o Icono */}
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Barra de Progreso */}
        <div className="w-full bg-dark-tertiary rounded-full h-2.5 mb-4">
          <motion.div
            className="bg-gradient-to-r from-green-400 to-green-500 h-2.5 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${Math.round(progress)}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>

        {/* Texto de Progreso */}
        <div className="text-center">
          <p className="text-white font-semibold text-lg">{Math.round(progress)}%</p>
          <p className="text-text-secondary tracking-widest text-sm uppercase mt-1 animate-pulse">
            Loading...
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedLoadingScreen;