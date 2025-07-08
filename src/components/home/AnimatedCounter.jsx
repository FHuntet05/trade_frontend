// frontend/src/components/home/AnimatedCounter.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const formatValue = (value) => {
  const [integerPart, decimalPart = '00'] = (value || 0).toFixed(2).split('.');
  return { integerPart, decimalPart: decimalPart.padStart(2, '0') };
};

const Digit = ({ digit }) => (
  <AnimatePresence mode="popLayout" initial={false}>
    <motion.span
      key={digit}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, duration: 0.3 }}
      className="inline-block"
    >
      {digit}
    </motion.span>
  </AnimatePresence>
);

const AnimatedCounter = ({ value }) => {
  const { integerPart, decimalPart } = formatValue(value);

  return (
    // <<< INICIO DE LA CORRECCIÓN (Punto #4): Clases de texto responsivas >>>
    <div className="text-4xl sm:text-5xl font-bold text-white tracking-wider font-mono flex items-baseline justify-center">
      <div className="inline-block">
        {integerPart.split('').map((digit, index) => (
          <Digit key={index} digit={digit} />
        ))}
      </div>
      <span>.</span>
      <div className="inline-block">
        {decimalPart.split('').map((digit, index) => (
          <Digit key={index} digit={digit} />
        ))}
      </div>
      {/* <<< CAMBIO MENOR: Tamaño del 'NTX' también se ajusta >>> */}
      <span className="text-xl sm:text-2xl text-accent-start align-middle ml-2 sm:ml-3">NTX</span>
    </div>
    // <<< FIN DE LA CORRECCIÓN >>>
  );
};

export default AnimatedCounter;