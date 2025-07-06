// frontend/src/components/home/AnimatedCounter.jsx (NUEVA VERSIÓN CON FRAMER-MOTION)
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Función para formatear el número en partes: enteros y decimales
const formatValue = (value) => {
  const [integerPart, decimalPart = ''] = value.toFixed(5).split('.');
  return { integerPart, decimalPart: decimalPart.padEnd(5, '0') };
};

// Componente para animar un solo dígito (el efecto "slot machine")
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
  const { integerPart, decimalPart } = formatValue(value || 0);

  return (
    <div className="text-5xl font-bold text-white tracking-wider font-mono flex items-baseline justify-center">
      {/* Mapeamos la parte entera */}
      <div className="inline-block">
        {integerPart.split('').map((digit, index) => (
          <Digit key={index} digit={digit} />
        ))}
      </div>
      <span>.</span>
      {/* Mapeamos la parte decimal */}
      <div className="inline-block">
        {decimalPart.split('').map((digit, index) => (
          <Digit key={index} digit={digit} />
        ))}
      </div>
      <span className="text-2xl text-accent-start align-middle ml-3">NTX</span>
    </div>
  );
};

export default AnimatedCounter;