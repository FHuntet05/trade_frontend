// frontend/src/components/ranking/RankingList.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaCrown } from 'react-icons/fa';

const RankingList = ({ data, loading, error, type }) => {
  if (loading) return <div className="text-center text-gray-400 py-8">Cargando ranking...</div>;
  if (error) return <div className="text-center text-red-400 py-8">{error}</div>;
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-8">No hay datos en la clasificación.</div>;
  }

  const getMedal = (index) => {
    if (index === 0) return <FaCrown className="text-yellow-400" />;
    if (index === 1) return <FaCrown className="text-gray-300" />;
    if (index === 2) return <FaCrown className="text-yellow-600" />;
    return <span className="text-gray-400 font-semibold">{index + 1}</span>;
  };

  const formatUsername = (name) => {
    if (!name || name.length <= 4) return name;
    return `${name.substring(0, 4)}****`;
  };

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        // --- LÓGICA CORREGIDA ---
        // Determinamos el valor del score basándonos en el tipo de ranking
        let scoreValue = 0;
        if (type === 'individual') {
          // Si es individual, el score está en 'balance.ntx'
          scoreValue = item.balance?.ntx || 0;
        } else {
          // Si es de equipo, el score es la propiedad 'score'
          scoreValue = item.score || 0;
        }

        return (
          <motion.div
            key={item._id || index}
            className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="text-lg w-6 text-center flex justify-center">{getMedal(index)}</div>
            
            <div className="flex-shrink-0 bg-gradient-to-br from-purple-600 to-pink-500 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white">
              {item.username?.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-grow">
              <p className="font-semibold text-white">{formatUsername(item.username)}</p>
              <p className="text-sm text-yellow-400 font-bold">
                {/* Usamos la variable 'scoreValue' que ya está verificada */}
                {scoreValue.toLocaleString()}
                {type === 'individual' && <span className="text-gray-400 font-normal ml-1">NTX</span>}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default RankingList;