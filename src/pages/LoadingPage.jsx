// RUTA: src/pages/LoadingPage.jsx

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSpring, animated } from 'react-spring';

const LoadingPage = () => {
  const [progress, setProgress] = useState(0);

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
    <div className="fixed inset-0 bg-system-background flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.175, 0.885, 0.32, 1.275]
        }}
        className="mb-12"
      >
        <div className="w-24 h-24 rounded-ios-2xl bg-gradient-to-br from-ios-green-light to-ios-green-dark flex items-center justify-center shadow-ios-card">
          <span className="text-5xl text-green-600 font-ios-display font-bold">AI</span>
        </div>
      </motion.div>

      <div className="w-48 h-1.5 bg-system-secondary rounded-full overflow-hidden">
        <animated.div
          style={progressAnimation}
          className="h-full bg-ios-green rounded-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 font-ios text-black text-sm"
      >
        {Math.round(progress)}%
      </motion.div>

      <div className="absolute bottom-10 flex items-center space-x-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-5 h-5 border-2 border-text-tertiary border-t-transparent rounded-full"
        />
        <span className="font-ios text-text-secondary text-sm">
          Cargando datos...
        </span>
      </div>
    </div>
  );
};

export default LoadingPage;