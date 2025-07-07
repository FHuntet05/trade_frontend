// frontend/src/components/home/AnimatedCounter.jsx (VERSIÓN CORREGIDA A 2 DECIMALES)
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- INICIO DE LA CORRECCIÓN ---
// Función para formatear el número en partes: enteros y 2 decimales.
const formatValue = (value) => {
  // 1. Usamos toFixed(2) para asegurar que siempre haya 2 decimales.
  const [integerPart, decimalPart = '00'] = value.toFixed(2).split('.');
  
  // 2. Nos aseguramos de que la parte decimal siempre tenga 2 dígitos (ej. si el valor es 5, será '00').
  return { integerPart, decimalPart: decimalPart.padStart(2, '0') };
};
// --- FIN DE LA CORRECCIÓN ---


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
      {/* Mapeamos la parte decimal (ahora siempre de 2 dígitos) */}
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