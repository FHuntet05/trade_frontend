// frontend/src/components/home/TaskCard.jsx
import React from 'react';
import { FaTelegramPlane } from 'react-icons/fa'; // Icono más apropiado
import { motion } from 'framer-motion';

const TaskCard = ({ task }) => {
  return (
    // Glassmorphism Card
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 flex flex-col space-y-3">
      <div className="flex justify-between items-start">
        {/* Título de la tarea */}
        <h3 className="font-semibold text-white pr-4">{task.title}</h3>
        {/* Recompensa */}
        <div className="flex items-center gap-1 text-yellow-400 font-bold flex-shrink-0">
          <span className="text-sm">+</span>
          <span>{task.reward.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Descripción y botón */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-400 flex items-center gap-2">
            <FaTelegramPlane />
            <span>{task.description}</span>
        </div>

        {/* Botón de acción */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-pink-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg"
        >
          Seguir
        </motion.button>
      </div>

      {/* Barra de progreso si existe */}
      {task.progress && (
        <div className="w-full bg-gray-700/50 rounded-full h-1.5">
          <div 
            className="bg-pink-500 h-1.5 rounded-full"
            style={{ width: `${(task.progress.current / task.progress.total) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;