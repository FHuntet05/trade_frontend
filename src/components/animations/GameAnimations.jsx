import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import confetti from 'canvas-confetti';

// Componente de la ruleta
export const SpinningWheel = ({ 
  rewards, 
  isSpinning,
  selectedReward,
  onSpinComplete,
  size = 300
}) => {
  const wheelRef = useRef(null);
  const spinControl = useAnimation();
  
  // Calcular ángulos para cada segmento
  const segmentAngle = 360 / rewards.length;
  
  useEffect(() => {
    if (isSpinning && selectedReward !== null) {
      const targetAngle = -(selectedReward * segmentAngle) + 1440; // 4 vueltas completas + posición final
      
      spinControl.start({
        rotate: [0, targetAngle],
        transition: {
          duration: 4,
          ease: [0.32, 0, 0.24, 1], // Custom easing para efecto realista
          times: [0, 1]
        }
      }).then(() => {
        // Efecto de confeti al completar
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        onSpinComplete();
      });
    }
  }, [isSpinning, selectedReward]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Flecha indicadora */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-0 h-0 border-l-8 border-r-8 border-b-[16px] border-l-transparent border-r-transparent border-b-ios-green" />
      </div>
      
      {/* Ruleta */}
      <motion.div
        ref={wheelRef}
        animate={spinControl}
        className="w-full h-full rounded-full overflow-hidden relative"
        style={{ 
          background: 'conic-gradient(from 0deg, #34C759, #32D74B, #30D158)',
          transform: 'rotate(0deg)',
          transformOrigin: 'center'
        }}
      >
        {rewards.map((reward, index) => {
          const rotation = index * segmentAngle;
          return (
            <div
              key={index}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 text-white font-ios text-sm"
              style={{
                transformOrigin: '0 0',
                transform: \`rotate(\${rotation}deg) translateY(-\${size/3}px)\`
              }}
            >
              {reward.type === 'xp' ? '✨' : reward.type === 'usdt' ? '💰' : '🎮'}
              {' '}
              {reward.value} {reward.type.toUpperCase()}
            </div>
          );
        })}
      </motion.div>

      {/* Bordes brillantes */}
      <div className="absolute inset-0 rounded-full pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-50" />
        <div className="absolute inset-0 rounded-full border-2 border-white/30" />
      </div>
    </div>
  );
};

// Componente del cofre del tesoro
export const TreasureChest = ({ 
  isOpening, 
  reward,
  onOpenComplete,
  size = 200 
}) => {
  const chestControl = useAnimation();
  const glowOpacity = useMotionValue(0);
  const glowScale = useTransform(glowOpacity, [0, 1], [0.8, 1.2]);
  
  useEffect(() => {
    if (isOpening) {
      // Secuencia de animación
      const animate = async () => {
        // Shake animation
        await chestControl.start({
          rotate: [0, -5, 5, -3, 3, 0],
          transition: { duration: 0.5 }
        });
        
        // Glow effect
        await chestControl.start({
          scale: [1, 1.1],
          transition: { duration: 0.3 }
        });
        
        // Pop open
        await chestControl.start({
          y: [-10, 0],
          scale: [1.1, 1],
          transition: { 
            duration: 0.5,
            type: "spring",
            stiffness: 300,
            damping: 15
          }
        });

        // Confetti explosion
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.7 }
        });

        onOpenComplete();
      };

      animate();
    }
  }, [isOpening]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Glow effect */}
      <motion.div
        style={{ opacity: glowOpacity, scale: glowScale }}
        className="absolute inset-0 bg-ios-green/30 rounded-2xl filter blur-xl"
      />
      
      {/* Chest */}
      <motion.div
        animate={chestControl}
        className="relative w-full h-full bg-gradient-to-b from-ios-green-light to-ios-green rounded-2xl shadow-lg"
      >
        {/* Lid */}
        <motion.div
          animate={isOpening ? { rotateX: 110 } : { rotateX: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-ios-green-light to-ios-green rounded-t-2xl"
          style={{ transformOrigin: "top", perspective: "1000px" }}
        >
          {/* Lock */}
          <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 bg-yellow-500 rounded-full border-4 border-yellow-600" />
        </motion.div>

        {/* Treasure glow */}
        {isOpening && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-4xl">
              {reward.type === 'xp' ? '✨' : reward.type === 'usdt' ? '💰' : '🎮'}
            </div>
          </motion.div>
        )}

        {/* Decorative elements */}
        <div className="absolute inset-x-4 top-4 h-2 bg-ios-green-dark rounded-full opacity-30" />
        <div className="absolute inset-x-4 bottom-4 h-2 bg-ios-green-dark rounded-full opacity-30" />
      </motion.div>
    </div>
  );
};

// Componente de explosión de recompensa
export const RewardBurst = ({ reward, onComplete }) => {
  const burstControl = useAnimation();
  
  useEffect(() => {
    const animate = async () => {
      await burstControl.start({
        scale: [0, 1.2, 1],
        opacity: [0, 1],
        transition: { 
          duration: 0.5,
          type: "spring",
          stiffness: 300
        }
      });
      
      // Particle explosion
      confetti({
        particleCount: 50,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#34C759', '#32D74B', '#30D158']
      });
      
      setTimeout(onComplete, 2000);
    };
    
    animate();
  }, []);

  return (
    <motion.div
      animate={burstControl}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-white rounded-ios-xl p-8 text-center shadow-xl"
      >
        <div className="text-6xl mb-4">
          {reward.type === 'xp' ? '✨' : reward.type === 'usdt' ? '💰' : '🎮'}
        </div>
        <h2 className="text-2xl font-ios-display font-bold mb-2">
          ¡Felicidades!
        </h2>
        <p className="text-ios-green font-ios text-xl">
          Ganaste {reward.value} {reward.type.toUpperCase()}
        </p>
      </motion.div>
    </motion.div>
  );
};