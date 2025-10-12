import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';

export const FadeInView = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SlideUpView = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const PressableScale = ({ children, onPress, disabled = false }) => {
  const [springProps, api] = useSpring(() => ({
    scale: 1,
  }));

  const handlePress = () => {
    if (disabled) return;
    
    api.start({
      from: { scale: 1 },
      to: [
        { scale: 0.95 },
        { scale: 1 }
      ],
    });
    onPress?.();
  };

  return (
    <animated.div
      style={springProps}
      onClick={handlePress}
      className={disabled ? 'opacity-50' : ''}
    >
      {children}
    </animated.div>
  );
};

export const AnimatedCounter = ({ value, duration = 1000 }) => {
  const springProps = useSpring({
    from: { number: 0 },
    to: { number: value },
    config: { duration }
  });

  return (
    <animated.span>
      {springProps.number.to(val => Math.floor(val))}
    </animated.span>
  );
};

export const AnimatedProgressBar = ({ progress, className = '' }) => {
  const springProps = useSpring({
    width: `${progress}%`,
    config: {
      tension: 300,
      friction: 20
    }
  });

  return (
    <div className={`h-2 bg-system-secondary rounded-full overflow-hidden ${className}`}>
      <animated.div
        style={springProps}
        className="h-full bg-ios-green rounded-full"
      />
    </div>
  );
};

export const AnimatedReward = ({ reward, onComplete }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.2, 1],
          opacity: 1
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{
          duration: 0.5,
          times: [0, 0.6, 1],
          ease: "easeInOut"
        }}
        onAnimationComplete={onComplete}
        className="fixed inset-0 flex items-center justify-center z-50"
      >
        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-ios-xl shadow-ios-card text-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="text-6xl mb-4"
          >
            {reward.type === 'xp' ? '✨' : reward.type === 'usdt' ? '💰' : '🎁'}
          </motion.div>
          
          <h2 className="text-2xl font-ios-display font-bold mb-2">
            ¡Felicitaciones!
          </h2>
          
          <p className="text-text-secondary">
            Has ganado{' '}
            <span className="text-ios-green font-semibold">
              {reward.type === 'xp' ? `${reward.value} XP` :
               reward.type === 'usdt' ? `${reward.value} USDT` :
               `${reward.value} Giro${reward.value > 1 ? 's' : ''}`}
            </span>
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};