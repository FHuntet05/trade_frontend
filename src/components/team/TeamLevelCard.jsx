// --- START OF FILE frontend/src/components/team/TeamLevelCard.jsx ---

// frontend/src/components/team/TeamLevelCard.jsx (MODIFICADO: Más grande y espaciado)
import React from 'react';
import { motion } from 'framer-motion';

const TeamLevelCard = ({ level, members, onShowDetails }) => (
  // --- CAMBIO: Aumentado el padding de p-4 a p-5 para más espacio interno ---
  <div className="bg-dark-secondary p-5 rounded-xl border border-white/10 text-white flex flex-col items-center text-center">
    {/* --- CAMBIO: Título más grande para mayor impacto --- */}
    <h3 className="font-bold text-xl text-text-secondary">NIVEL {level}</h3>
    
    <p className="text-3xl font-bold text-white my-2">{members}</p>
    <p className="text-sm text-text-secondary mb-4">Personas</p> {/* Aumentado margen inferior */}
    
    <motion.button 
      onClick={() => onShowDetails(level)} 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-full py-2 text-sm font-semibold bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
    >
      Detalles
    </motion.button>
  </div>
);

export default TeamLevelCard;
// --- END OF FILE frontend/src/components/team/TeamLevelCard.jsx ---