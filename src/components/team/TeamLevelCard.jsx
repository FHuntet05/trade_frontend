// --- START OF FILE frontend/src/components/team/TeamLevelCard.jsx (REDiseñado) ---

import React from 'react';
import { motion } from 'framer-motion';
import { triggerImpactHaptic } from '../../utils/haptics'; // Asumo que creaste este archivo

const TeamLevelCard = ({ level, totalMembers, validMembers, onShowDetails }) => {

  const handleClick = () => {
    triggerImpactHaptic('medium');
    onShowDetails(level);
  };

  return (
    <div className="bg-dark-secondary p-4 rounded-xl border border-white/10 text-white flex flex-col justify-between text-center space-y-3">
      <h3 className="font-bold text-lg text-white">LEV {level}</h3>
      
      <div className="space-y-1">
        <p className="text-sm text-text-secondary">Número de personas</p>
        <p className="text-2xl font-bold text-white">{totalMembers}</p>
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-text-secondary">Válido</p>
        <p className="text-2xl font-bold text-white">{validMembers}</p>
      </div>
      
      <motion.button 
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full py-2 mt-2 text-sm font-semibold bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
      >
        Detalles
      </motion.button>
  </div>
  );
};

export default TeamLevelCard;
// --- END OF FILE frontend/src/components/team/TeamLevelCard.jsx ---