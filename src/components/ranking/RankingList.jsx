// frontend/src/components/ranking/RankingList.jsx (SIMPLIFICADO Y CORREGIDO)
import React from 'react';
import { motion } from 'framer-motion';
import { FaCrown } from 'react-icons/fa';

// --- NUEVA FUNCIÓN: Para ofuscar el nombre de usuario ---
const formatUsername = (name) => {
  if (!name || name.length <= 4) return name;
  return `${name.substring(0, 4)}****`;
};

const RankingList = ({ data, isScoreNtx }) => {
  // No necesitamos props de loading/error aquí si las manejamos en la página padre.
  if (!data || data.length === 0) {
    return <div className="text-center text-text-secondary py-8">No hay datos en la clasificación.</div>;
  }

  const getMedalOrRank = (index, rank) => {
    if (rank === 1) return <FaCrown className="text-yellow-400" />;
    if (rank === 2) return <FaCrown className="text-gray-300" />;
    if (rank === 3) return <FaCrown className="text-yellow-600" />;
    // Usamos el 'rank' que viene del backend
    return <span className="text-text-secondary font-semibold">{rank}</span>;
  };

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <motion.div
          key={item.username + item.rank} // Una clave más robusta
          // --- CAMBIO: Se añade un borde resaltado para el usuario actual ---
          className={`bg-dark-secondary rounded-xl p-3 border ${
            item.isCurrentUser ? 'border-accent-start' : 'border-white/10'
          } flex items-center gap-4`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <div className="text-lg w-6 text-center flex justify-center">{getMedalOrRank(index, item.rank)}</div>
          
          <div className="flex-shrink-0 bg-gradient-to-br from-purple-600 to-pink-500 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white">
            {item.username?.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-grow">
            <p className="font-semibold text-white">{formatUsername(item.username)}</p>
            <p className="text-sm text-yellow-400 font-bold">
              {/* --- CAMBIO: Leemos directamente de 'item.score' --- */}
              {item.score?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              {/* Se muestra 'NTX' o nada, según la prop */}
              {isScoreNtx && <span className="text-text-secondary font-normal ml-1">NTX</span>}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RankingList;