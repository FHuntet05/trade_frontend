// frontend/src/components/team/TeamLevelCard.jsx (REDiseñado para layout horizontal)
import React from 'react';
import { motion } from 'framer-motion';

const TeamLevelCard = ({ level, members, onShowDetails }) => (
  <div className="bg-dark-secondary p-4 rounded-xl border border-white/10 text-white flex flex-col items-center text-center">
    <h3 className="font-bold text-lg text-text-secondary">NIVEL {level}</h3>
    
    <p className="text-3xl font-bold text-white my-2">{members}</p>
    <p className="text-sm text-text-secondary mb-3">Personas</p>
    
    <motion.button 
      onClick={() => onShowDetails(level)} 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-full py-2 text-xs font-semibold bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
    >
      Detalles
    </motion.button>
  </div>
);

export default TeamLevelCard;