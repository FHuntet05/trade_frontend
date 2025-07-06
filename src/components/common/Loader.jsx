// frontend/src/components/common/Loader.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { PacmanLoader } from 'react-spinners'; // O cualquier otro de react-spinners

const Loader = ({ text = "Cargando..." }) => {
  return (
    // Animamos la entrada y salida del propio loader para una transición suave
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center pt-16 gap-4 w-full h-full"
    >
      <PacmanLoader color="#E84D8A" size={25} />
      <p className="text-text-secondary mt-4">{text}</p>
    </motion.div>
  );
};

export default Loader;