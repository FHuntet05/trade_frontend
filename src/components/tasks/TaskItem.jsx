// frontend/src/components/tasks/TaskItem.jsx

import React from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useUserStore from '../../store/userStore';
import api from '../../api/axiosConfig';

const TaskItem = ({ task, isClaimed, isCompleted, referralCount, onClaimSuccess }) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleClaim = async () => {
    if (isClaimed || !isCompleted || isProcessing) return;

    setIsProcessing(true);
    const claimPromise = api.post('/wallet/tasks/claim', { taskName: task.id });

    toast.promise(claimPromise, {
      loading: 'Reclamando recompensa...',
      success: (res) => {
        onClaimSuccess(res.data.user); // Actualizamos el usuario en el estado global
        return res.data.message;
      },
      error: (err) => err.response?.data?.message || 'No se pudo reclamar la recompensa.',
    }).finally(() => setIsProcessing(false));
  };

  const getButtonState = () => {
    if (isClaimed) {
      return { text: 'Reclamado', disabled: true, className: 'bg-gray-500/30 text-text-secondary' };
    }
    if (isCompleted) {
      return { text: 'Reclamar', disabled: isProcessing, className: 'bg-accent-start hover:bg-accent-start/80 text-white' };
    }
    // Estado "en progreso"
    return { text: 'Ir', disabled: false, className: 'bg-blue-500/80 hover:bg-blue-500/60 text-white' };
  };

  const buttonState = getButtonState();

  const handleGo = () => {
    if (task.id === 'joinedTelegram' && task.link) {
        window.open(task.link, '_blank');
    }
    // Aquí se podría añadir lógica para navegar a otras páginas si la tarea lo requiere.
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/10">
      <div className="flex-1">
        <h3 className="font-bold text-white">{task.title}</h3>
        <p className="text-sm text-text-secondary">{task.description}</p>
        {task.id === 'invitedTenFriends' && !isCompleted && (
            <p className="text-xs text-accent-start/80 mt-1">Progreso: {referralCount} / 10</p>
        )}
      </div>
      <div className="flex items-center gap-4 ml-4">
        <div className="text-right">
            <p className="font-bold text-lg text-yellow-400">+{task.reward}</p>
            <p className="text-xs text-yellow-400/70">NTX</p>
        </div>
        <button
          onClick={buttonState.text === 'Ir' ? handleGo : handleClaim}
          disabled={buttonState.disabled}
          className={`w-24 py-2 font-bold rounded-full transition-colors text-sm ${buttonState.className}`}
        >
          {isProcessing ? '...' : buttonState.text}
        </button>
      </div>
    </div>
  );
};

export default TaskItem;