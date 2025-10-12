import React from 'react';
import { motion } from 'framer-motion';
import { useSpring, animated } from 'react-spring';

export const IOSButton = ({ children, variant = 'primary', onClick, disabled }) => {
  const baseClasses = 'font-ios px-4 py-2 rounded-ios-button transition-all duration-300 active:scale-95';
  
  const variants = {
    primary: 'bg-ios-green text-white shadow-ios-button',
    secondary: 'bg-system-secondary text-ios-green',
    outline: 'border border-ios-green text-ios-green'
  };

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]}`}
      whileTap={{ scale: 0.97 }}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

export const IOSCard = ({ children, className }) => (
  <div className={`bg-system-grouped-secondary rounded-ios-card shadow-ios-card p-4 ${className}`}>
    {children}
  </div>
);

export const IOSInput = ({ placeholder, value, onChange, type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-4 py-3 rounded-ios bg-system-secondary text-text-primary placeholder-text-tertiary font-ios border-0 focus:ring-2 focus:ring-ios-green focus:outline-none"
  />
);

export const IOSSegmentedControl = ({ options, selected, onChange }) => (
  <div className="flex bg-system-secondary rounded-ios p-1">
    {options.map((option, index) => (
      <button
        key={option}
        className={`flex-1 py-2 px-4 text-sm font-ios transition-all duration-200 ${
          selected === index
            ? 'bg-white rounded-ios shadow-ios-button text-text-primary'
            : 'text-text-secondary'
        }`}
        onClick={() => onChange(index)}
      >
        {option}
      </button>
    ))}
  </div>
);

export const IOSSpinner = () => {
  const spin = useSpring({
    from: { rotate: 0 },
    to: { rotate: 360 },
    loop: true,
    config: { duration: 1000 }
  });

  return (
    <animated.div
      style={spin}
      className="w-8 h-8 border-2 border-ios-green border-t-transparent rounded-full"
    />
  );
};

// Componente para la ruleta
export const Wheel = ({ spinning, onSpinComplete }) => {
  const wheelSpring = useSpring({
    from: { rotate: 0 },
    to: { rotate: spinning ? 1800 : 0 },
    config: { tension: 100, friction: 20 },
    onRest: onSpinComplete
  });

  return (
    <animated.div
      style={wheelSpring}
      className="w-64 h-64 bg-gradient-to-r from-gradient-green-light to-gradient-green-dark rounded-full"
    >
      {/* Contenido de la ruleta */}
    </animated.div>
  );
};

// Componente para el cofre
export const TreasureChest = ({ isOpening, onOpenComplete }) => {
  const chestSpring = useSpring({
    transform: isOpening
      ? 'scale(1.2) rotate(5deg)'
      : 'scale(1) rotate(0deg)',
    config: { tension: 300, friction: 10 },
    onRest: onOpenComplete
  });

  return (
    <animated.div
      style={chestSpring}
      className="w-32 h-32 bg-gradient-to-b from-gradient-green-light to-gradient-green-dark rounded-ios-xl"
    >
      {/* Contenido del cofre */}
    </animated.div>
  );
};