// frontend/src/components/tasks/TaskItem.jsx (CON FLUJO SIMPLIFICADO IMPLEMENTADO)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';
import { FaCheck, FaAngleRight, FaGift } from 'react-icons/fa';

const TaskItem = ({ task, isCompleted, isClaimed, referralCount, onTaskUpdate }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGo = async () => {
    // Para tareas que solo navegan
    if (task.id === 'boughtUpgrade') return navigate('/tools');
    if (task.id === 'invitedTenFriends') return navigate('/team');

    // Para la tarea del canal de Telegram
    if (task.id === 'joinedTelegram' && task.link) {
      if (isLoading) return;
      setIsLoading(true);
      toast.loading('Abriendo canal...', { id: `task-go-${task.id}` });

      try {
        // --- LLAMADA AL NUEVO ENDPOINT DEL BACKEND ---
        // Marcamos la tarea como "visitada" ANTES de redirigir al usuario.
        const response = await api.post('/tasks/mark-as-visited', { taskName: task.id });
        onTaskUpdate(response.data.user); // Actualiza el estado global
        
        // --- REDIRECCIÓN SEGURA ---
        window.Telegram.WebApp.openTelegramLink(task.link);
        toast.dismiss(`task-go-${task.id}`);

      } catch (error) {
        const errorMessage = error.response?.data?.message || 'No se pudo procesar la acción.';
        toast.error(errorMessage, { id: `task-go-${task.id}` });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClaim = async () => {
    if (isLoading) return;
    setIsLoading(true);
    toast.loading('Reclamando recompensa...', { id: `task-claim-${task.id}` });
    try {
      const response = await api.post('/tasks/claim', { taskName: task.id });
      toast.success(response.data.message || '¡Recompensa reclamada!', { id: `task-claim-${task.id}` });
      onTaskUpdate(response.data.user);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'No se pudo reclamar la recompensa.';
      toast.error(errorMessage, { id: `task-claim-${task.id}` });
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskDescription = () => {
    if (task.id === 'invitedTenFriends') {
      return `Tu equipo debe tener 3 miembros (${referralCount || 0}/3).`;
    }
    return task.description;
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