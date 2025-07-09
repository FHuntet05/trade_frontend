// frontend/src/components/tasks/TaskItem.jsx (NUEVO DISEÑO Y LÓGICA CORREGIDA)
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
      // La llamada a la API es correcta, sin '/api'
      const response = await api.post('/tasks/claim', { taskName: task.id });
      toast.success(response.data.message || '¡Recompensa reclamada!', { id: `task-${task.id}` });
      onClaimSuccess(response.data.user);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'No se pudo reclamar la recompensa.';
      toast.error(errorMessage, { id: `task-${task.id}` });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleGo = () => {
    // Primero, ejecuta la acción de navegación/apertura de enlace.
    if (task.id === 'boughtUpgrade') navigate('/tools');
    if (task.id === 'invitedTenFriends') navigate('/team');
    if (task.id === 'joinedTelegram' && task.link) {
      // Abre el enlace del canal de Telegram en una nueva pestaña.
      window.open(task.link, '_blank');
      
      // Simulación de UX: Para que el usuario no tenga que recargar, podemos
      // llamar a onClaimSuccess con el usuario actual para forzar un re-fetch
      // del estado de las tareas desde TaskCenter, lo que podría habilitar el botón "Reclamar".
      // Esta es una mejora opcional pero recomendada.
      onClaimSuccess(useUserStore.getState().user);
    }
  };

  const getTaskDescription = () => {
    if (task.id === 'invitedTenFriends') {
      return `Tu equipo debe tener 10 miembros (${referralCount}/10).`;
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
        <motion.button
          onClick={handleClaim}
          disabled={isClaiming}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-28 h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-accent-start to-accent-end text-white text-sm font-bold px-4 py-2 rounded-lg"
        >
          <FaGift /> Reclamar
        </motion.button>
      );
    }
    return (
      <motion.button
        onClick={handleGo}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-28 h-10 flex items-center justify-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg"
      >
        Ir <FaAngleRight />
      </motion.button>
    );
  };

  return (
    // <<< INICIO DE LA RE-ESTRUCTURACIÓN DEL LAYOUT >>>
    <div className="bg-dark-secondary p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4">
      
      {/* Columna Izquierda: Título y Descripción */}
      <div className="flex-1">
        <h4 className="font-bold text-white text-base">{task.title}</h4>
        <p className="text-xs text-text-secondary mt-1">{getTaskDescription()}</p>
      </div>

      {/* Columna Derecha: Botón y Recompensa (apilados verticalmente) */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        {renderButton()}
        <div className="text-center">
          <p className="font-bold text-sm text-accent-start">+{task.reward.toLocaleString()} NTX</p>
        </div>
      </div>

    </div>
    // <<< FIN DE LA RE-ESTRUCTURACIÓN DEL LAYOUT >>>
  );
};

export default TaskItem;