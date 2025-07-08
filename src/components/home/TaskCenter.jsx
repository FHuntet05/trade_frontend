// frontend/src/components/home/TaskCenter.jsx (VERSIÓN CORREGIDA)
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axiosConfig';
import useUserStore from '../../store/userStore';
import TaskItem from '../tasks/TaskItem'; // <<< Asegúrate de que esta ruta sea correcta

const TaskCenter = () => {
  const { user, updateUser } = useUserStore();
  const [taskStatus, setTaskStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // <<< CORRECCIÓN: Título centrado y sin lógica extra aquí
  const allTasks = [
    { id: 'boughtUpgrade', title: 'Primera Mejora', description: 'Compra cualquier herramienta VIP.', reward: 1500 },
    { id: 'invitedTenFriends', title: 'Invitar 10 Amigos', description: 'Tu equipo debe tener 10 miembros.', reward: 1000 },
    { id: 'joinedTelegram', title: 'Unirse al Canal', description: 'Únete a nuestra comunidad oficial.', reward: 500, link: process.env.REACT_APP_TELEGRAM_CHANNEL_URL || 'https://t.me/telegram' },
  ];

  useEffect(() => {
    const fetchTaskStatus = async () => {
      setLoading(true);
      try {
        // <<< LLAMADA A LA API: Asumimos esta ruta. La confirmaremos.
        const response = await api.get('/api/tasks/status');
        setTaskStatus(response.data);
      } catch (err) {
        console.error("Error al cargar el estado de las tareas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTaskStatus();
  }, [user]); // <<< Se re-ejecuta si el usuario cambia para mayor consistencia

  const handleClaimSuccess = (updatedUser) => {
    updateUser(updatedUser);
    // Para reflejar el cambio en 'claimedTasks', volvemos a fetchear el estado.
    api.get('/api/tasks/status').then(res => setTaskStatus(res.data));
  };
  
  if (loading && !taskStatus) {
    return (
        <div className="w-full space-y-4 bg-dark-secondary p-4 rounded-2xl border border-white/10">
            {/* <<< CORRECCIÓN (Punto #6): Título centrado */}
            <h2 className="text-xl font-bold text-white text-center mb-2">Centro de Tareas</h2>
            <div className="h-16 bg-dark-primary rounded-xl animate-pulse"></div>
            <div className="h-16 bg-dark-primary rounded-xl animate-pulse"></div>
            <div className="h-16 bg-dark-primary rounded-xl animate-pulse"></div>
        </div>
    );
  }

  return (
    <div className="w-full space-y-4 bg-dark-secondary p-4 rounded-2xl border border-white/10">
      {/* <<< CORRECCIÓN (Punto #6): Título centrado */}
      <h2 className="text-xl font-bold text-white text-center mb-2">Centro de Tareas</h2>
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {allTasks.map(task => {
          if (!taskStatus) return null;

          const isClaimed = taskStatus.claimedTasks?.[task.id] || false;
          let isCompleted = false; // <<< Lógica de completado simplificada, el backend es la fuente de verdad

          // El backend nos dice si una tarea es completable o no.
          if (task.id === 'boughtUpgrade') isCompleted = taskStatus.canClaim.boughtUpgrade;
          if (task.id === 'invitedTenFriends') isCompleted = taskStatus.canClaim.invitedTenFriends;
          if (task.id === 'joinedTelegram') isCompleted = taskStatus.canClaim.joinedTelegram;
          
          return (
            <TaskItem
              key={task.id}
              task={task}
              isClaimed={isClaimed}
              isCompleted={isCompleted && !isClaimed} // <<< Solo está 'completada' si no ha sido reclamada
              referralCount={taskStatus.referralCount || 0}
              onClaimSuccess={handleClaimSuccess}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

export default TaskCenter;