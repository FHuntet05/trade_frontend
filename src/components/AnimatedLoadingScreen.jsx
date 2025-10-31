// RUTA: src/components/AnimatedLoadingScreen.jsx
// --- VERSIÓN CORREGIDA Y SINCRONIZADA ---

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// La prop `isDoneLoading` será `true` cuando los datos del usuario ya estén listos.
const AnimatedLoadingScreen = ({ isDoneLoading }) => {
  const [progress, setProgress] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Si la carga real ha terminado (isDoneLoading = true),
    // forzamos la barra al 100% y preparamos la animación de salida.
    if (isDoneLoading) {
      setProgress(100);
      // Pequeño delay para que el usuario vea el 100% antes de la transición.
      setTimeout(() => setIsAnimatingOut(true), 400); 
      return; 
    }

    // Si la carga aún no ha terminado, continuamos con la animación simulada.
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 95) { // No llega al 100% por sí sola
          return 95;
        }
        const increment = Math.random() * 10;
        return Math.min(prevProgress + increment, 95);
      });
    }, 400);

    return () => clearInterval(timer);
  }, [isDoneLoading]); // El efecto ahora depende de si la carga ha finalizado.

  return (
    // La animación de salida envuelve toda la pantalla
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isAnimatingOut ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-dark-primary flex items-center justify-center p-4"
    >
      <motion.div
        // El contenido también puede tener su propia animación de escala
        animate={{ scale: isAnimatingOut ? 0.95 : 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xs bg-dark-secondary rounded-2xl shadow-lg p-8 flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6">
           <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="w-full bg-dark-tertiary rounded-full h-2.5 mb-4">
          <motion.div
            className="bg-gradient-to-r from-green-400 to-green-500 h-2.5 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }} // El progreso ahora es controlado por el estado
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg">{Math.round(progress)}%</p>
          <p className="text-text-secondary tracking-widest text-sm uppercase mt-1">
            {isDoneLoading ? 'Completo' : 'Loading...'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnimatedLoadingScreen;