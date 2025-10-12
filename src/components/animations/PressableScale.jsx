import React from 'react';
import { motion } from 'framer-motion';

const PressableScale = ({ children, onPress, scale = 0.95, disabled = false }) => {
  return (
    <motion.div
      whileTap={{ scale: disabled ? 1 : scale }}
      transition={{ duration: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={disabled ? undefined : onPress}
      className={disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
    >
      {children}
    </motion.div>
  );
};

export default PressableScale;