// frontend/src/components/tasks/TaskItem.jsx (COMPLETO Y SIMPLIFICADO)
import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaAngleRight, FaGift } from 'react-icons/fa';

const TaskItem = ({ task, isCompleted, isClaimed, referralCount, onGoToTask, onClaim }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const getTaskDescription = () => {
    if (task.id === 'invitedTenFriends') {
      return `Tu equipo debe tener 3 miembros (${referralCount || 0}/3).`;
    }
    return task.description;
  };

  const handleGo = async () => {
    setIsLoading(true);
    await onGoToTask(task);
    setIsLoading(false);
  };

  const handleClaim = async () => {
    setIsLoading(true);
    await onClaim(task);
    setIsLoading(false);
  };

  const renderButton = () => {
    if (isClaimed) {
      return (
        <button disabled className="w-28 h-10 flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-green-500/30 text-green-300 cursor-default">
          <FaCheck /> Reclamado
        </button>
      );
    }
    if (isCompleted) {
      return (
        <motion.button onClick={handleClaim} disabled={isLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-28 h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-accent-start to-accent-end text-white text-sm font-bold px-4 py-2 rounded-lg">
          <FaGift /> Reclamar
        </motion.button>
      );
    }
    return (
      <motion.button onClick={handleGo} disabled={isLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-28 h-10 flex items-center justify-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg">
        Ir <FaAngleRight />
      </motion.button>
    );
  };

  return (
    <div className="bg-dark-secondary p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4">
      <div className="flex-1">
        <h4 className="font-bold text-white text-base">{task.title}</h4>
        <p className="text-xs text-text-secondary mt-1">{getTaskDescription()}</p>
      </div>
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        {renderButton()}
        <div className="text-center">
          <p className="font-bold text-sm text-accent-start">+{task.reward.toLocaleString()} NTX</p>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;