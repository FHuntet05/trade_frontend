// frontend/src/components/common/Loader.jsx (NUEVO DISEÑO MINIMALISTA)
import React from 'react';
import { motion } from 'framer-motion';
import { ClipLoader } from 'react-spinners'; // <<< Importamos el loader circular

const Loader = ({ text = "Cargando..." }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center w-full h-full"
    >
      {/* --- INICIO DEL NUEVO DISEÑO DEL LOADER --- */}
      <div className="bg-dark-secondary/50 backdrop-blur-sm p-8 rounded-2xl flex flex-col items-center justify-center gap-6 border border-white/10">
        <ClipLoader color="#E84D8A" size={40} speedMultiplier={0.8} />
        {text && <p className="text-text-primary mt-2">{text}</p>}
      </div>
      {/* --- FIN DEL NUEVO DISEÑO DEL LOADER --- */}
    </motion.div>
  );
};

export default Loader;