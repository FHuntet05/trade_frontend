import React from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import useStore from '../../store/store';

const SEGMENTS = 8; // Número de segmentos en la ruleta
const SEGMENT_COLORS = [
  'from-ios-green to-ios-green-light',
  'from-ios-green-light to-ios-green',
  'from-ios-green to-ios-green-light',
  'from-ios-green-light to-ios-green',
  'from-ios-green to-ios-green-light',
  'from-ios-green-light to-ios-green',
  'from-ios-green to-ios-green-light',
  'from-ios-green-light to-ios-green',
];

export const Wheel = ({ onSpinComplete }) => {
  const wheelControls = useAnimationControls();
  const { spins, spinWheel } = useStore();
  const [isSpinning, setIsSpinning] = React.useState(false);

  const handleSpin = async () => {
    if (isSpinning || spins <= 0) return;

    setIsSpinning(true);
    try {
      const reward = await spinWheel();
      const segmentIndex = SEGMENTS - (reward.index + 1);
      const rotations = 5; // Número de rotaciones completas
      const finalAngle = rotations * 360 + (segmentIndex * (360 / SEGMENTS));

      await wheelControls.start({
        rotate: finalAngle,
        transition: {
          duration: 4,
          type: "spring",
          stiffness: 30,
          damping: 15
        }
      });

      onSpinComplete?.(reward);
    } catch (error) {
      console.error('Spin error:', error);
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <div className="relative w-72 h-72">
      {/* Ruleta */}
      <motion.div
        animate={wheelControls}
        className="w-full h-full rounded-full overflow-hidden relative"
      >
        {Array.from({ length: SEGMENTS }).map((_, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full
              bg-gradient-to-r ${SEGMENT_COLORS[index % SEGMENT_COLORS.length]}`}
            style={{
              transform: `rotate(${index * (360 / SEGMENTS)}deg)`,
              transformOrigin: '50% 50%',
              clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(0)}% ${50 + 50 * Math.sin(0)}%, ${50 + 50 * Math.cos(2 * Math.PI / SEGMENTS)}% ${50 + 50 * Math.sin(2 * Math.PI / SEGMENTS)}%)`
            }}
          />
        ))}

        {/* Centro de la ruleta */}
        <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white shadow-ios-card flex items-center justify-center">
          <span className="text-ios-green font-ios-display font-bold">
            {spins}
          </span>
        </div>
      </motion.div>

      {/* Flecha indicadora */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8">
        <div className="w-0 h-0 border-l-[1rem] border-r-[1rem] border-t-[2rem] border-l-transparent border-r-transparent border-t-ios-green" />
      </div>

      {/* Botón de giro */}
      <button
        onClick={handleSpin}
        disabled={isSpinning || spins <= 0}
        className={`absolute -bottom-16 left-1/2 -translate-x-1/2 
          px-8 py-3 rounded-ios bg-ios-green text-white font-ios
          shadow-ios-button transition-all ${
            isSpinning || spins <= 0 ? 'opacity-50' : 'active:scale-95'
          }`}
      >
        {isSpinning ? 'Girando...' : 'Girar'}
      </button>
    </div>
  );
};