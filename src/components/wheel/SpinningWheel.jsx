import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { IOSCard } from '../ui/IOSComponents';

export const WheelSegment = ({ color, icon, text, percentage, rotate }) => (
  <motion.div
    className="absolute w-full h-full origin-center"
    style={{ rotate }}
  >
    <div 
      className={`absolute left-0 top-0 w-1/2 h-full origin-right ${color}`}
      style={{ 
        transform: 'skewY(30deg)',
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
      }}
    >
      <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
        <span className="text-2xl">{icon}</span>
        <p className="text-xs mt-1">{text}</p>
        <p className="text-[10px] opacity-70">{percentage}%</p>
      </div>
    </div>
  </motion.div>
);

export const SpinningWheel = ({ segments, onSpinComplete, isSpinning, setIsSpinning }) => {
  const controls = useAnimation();
  const wheelRef = useRef(null);
  const rotate = useMotionValue(0);
  
  const calculatePrize = (finalRotation) => {
    const normalizedRotation = finalRotation % 360;
    const segmentSize = 360 / segments.length;
    const selectedIndex = Math.floor(normalizedRotation / segmentSize);
    return segments[selectedIndex];
  };

  const spin = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    const spins = 5 + Math.random() * 5; // 5-10 vueltas completas
    const extraDegrees = Math.random() * 360; // Grados adicionales
    const finalRotation = spins * 360 + extraDegrees;

    await controls.start({
      rotate: finalRotation,
      transition: {
        duration: 5,
        ease: [0.17, 0.67, 0.83, 0.67], // Personalizado para efecto realista
        type: "spring",
        damping: 15
      }
    });

    const prize = calculatePrize(finalRotation);
    onSpinComplete(prize);
    setIsSpinning(false);
  };

  useEffect(() => {
    rotate.onChange((latest) => {
      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${latest}deg)`;
      }
    });
  }, [rotate]);

  return (
    <IOSCard className="p-6 relative">
      <div className="aspect-square relative">
        <motion.div
          ref={wheelRef}
          animate={controls}
          className="w-full h-full rounded-full border-4 border-ios-green relative overflow-hidden"
          style={{ rotate }}
        >
          {segments.map((segment, index) => (
            <WheelSegment
              key={index}
              {...segment}
              rotate={index * (360 / segments.length)}
            />
          ))}
        </motion.div>
        
        {/* Flecha indicadora */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8">
          <svg viewBox="0 0 24 24" className="w-full h-full text-ios-green">
            <path d="M12 4l-8 8h16z" fill="currentColor" />
          </svg>
        </div>

        {/* Botón de giro */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={spin}
          disabled={isSpinning}
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-16 h-16 rounded-full bg-ios-green text-white
            font-ios-display font-semibold shadow-ios-button
            flex items-center justify-center
            ${isSpinning ? 'opacity-50' : 'hover:bg-ios-green/90'}
          `}
        >
          {isSpinning ? '🎲' : 'SPIN'}
        </motion.button>
      </div>
    </IOSCard>
  );
};