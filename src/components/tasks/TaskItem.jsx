// frontend/src/components/tasks/TaskItem.jsx (NUEVO ARCHIVO REFACTORIZADO)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';
import { FaCheck, FaAngleRight, FaGift } from 'react-icons/fa';

const TaskItem = ({ task, isCompleted, isClaimed, referralCount, onClaimSuccess }) => {
  const navigate = useNavigate();
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    if (isClaiming) return;
    setIsClaiming(true);
    toast.loading('Reclamando recompensa...', { id: `task-${task.id}` });
    try {
      // <<< LLAMADA A LA API: Asumimos esta ruta. La confirmaremos con tus archivos.
      const response = await api.post('/api/tasks/claim', { taskName: task.id });
      toast.success(response.data.message || '¡Recompensa reclamada!', { id: `task-${task.id}` });
      onClaimSuccess(response.data.user);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'No se pudo reclamar la recompensa.';
      toast.error(errorMessage, { id: `task-${task.id}` });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleNavigation = () => {
    if (task.id === 'boughtUpgrade') navigate('/tools');
    if (task.id === 'invitedTenFriends') navigate('/team');
    if (task.id === 'joinedTelegram' && task.link) {
      window.open(task.link, '_blank');
      // Opcional: Marcar como completada localmente para habilitar el reclamo inmediato
      // Esto es una mejora de UX, la validación final la hace el backend.
    }
  };

  const renderButton = () => {
    if (isClaimed) {
      return (
        <button disabled className="flex items-center justify-center gap-2 w-28 text-sm font-semibold px-4 py-2 rounded-lg bg-green-500/30 text-green-300 cursor-default">
          <FaCheck />
          Reclamado
        </button>
      );
    }
    if (isCompleted) {
      return (
        <motion.button
          onClick={handleClaim}
          disabled={isClaiming}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center gap-2 w-28 bg-gradient-to-r from-accent-start to-accent-end text-white text-sm font-bold px-4 py-2 rounded-lg"
        >
          <FaGift />
          Reclamar
        </motion.button>
      );
    }
    return (
      <motion.button
        onClick={handleNavigation}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center gap-2 w-28 bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg"
      >
        Ir
        <FaAngleRight />
      </motion.button>
    );
  };

  const getTaskDescription = () => {
    if (task.id === 'invitedTenFriends') {
      return `Tu equipo debe tener 10 miembros (${referralCount}/10).`;
    }
    return task.description;
  };

  return (
    <div className="bg-dark-secondary p-3 rounded-xl border border-white/10 flex items-center justify-between gap-4">
      <div className="flex-grow">
        <h4 className="font-bold text-white">{task.title}</h4>
        <p className="text-xs text-text-secondary">{getTaskDescription()}</p>
      </div>
      <div className="flex-shrink-0 flex items-center gap-4">
        <div className="text-right">
          <p className="font-bold text-lg text-accent-start">+{task.reward.toLocaleString()}</p>
          <p className="text-xs text-text-secondary">NTX</p>
        </div>
        {renderButton()}
      </div>
    </div>
  );
};

export default TaskItem;