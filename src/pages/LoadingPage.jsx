import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSpring, animated } from 'react-spring';

const LoadingPage = () => {
  const [progress, setProgress] = useState(0);

  // Animación del progreso
  const progressAnimation = useSpring({
    width: `${progress}%`,
    config: {
      tension: 300,
      friction: 20
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-system-background flex flex-col items-center justify-center ios-safe-top ios-safe-bottom">
      {/* Logo animado */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.175, 0.885, 0.32, 1.275]
        }}
        className="mb-12"
      >
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-ios-green-light to-ios-green-dark flex items-center justify-center shadow-ios-card">
          {/* Aquí puedes poner tu logo */}
          <span className="text-4xl text-white">💱</span>
        </div>
      </motion.div>

      {/* Barra de progreso estilo iOS */}
      <div className="w-48 h-1.5 bg-system-secondary rounded-full overflow-hidden">
        <animated.div
          style={progressAnimation}
          className="h-full bg-ios-green rounded-full"
        />
      </div>

      {/* Porcentaje */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 font-ios text-text-secondary text-sm"
      >
        {Math.round(progress)}%
      </motion.div>

      {/* Indicador de actividad estilo iOS */}
      <div className="mt-8 flex items-center space-x-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-5 h-5 border-2 border-ios-green border-t-transparent rounded-full"
        />
        <span className="font-ios text-text-secondary text-sm">
          Iniciando aplicación...
        </span>
      </div>
    </div>
  );
};

export default LoadingPage;