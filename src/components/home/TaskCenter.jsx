// frontend/src/components/home/TaskCenter.jsx (VERSIÓN CON LLAMADA A API CORREGIDA)
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axiosConfig';
import useUserStore from '../../store/userStore';
import TaskItem from '../tasks/TaskItem';

const TaskCenter = () => {
  const { user, updateUser } = useUserStore();
  const [taskStatus, setTaskStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const allTasks = [
    { id: 'boughtUpgrade', title: 'Primera Mejora', description: 'Compra cualquier herramienta VIP.', reward: 1500 },
    { id: 'invitedTenFriends', title: 'Invitar 10 Amigos', description: 'Tu equipo debe tener 10 miembros.', reward: 1000 },
    { id: 'joinedTelegram', title: 'Unirse al Canal', description: 'Únete a nuestra comunidad oficial.', reward: 500, link: process.env.REACT_APP_TELEGRAM_CHANNEL_URL || 'https://t.me/telegram' },
  ];

  useEffect(() => {
    const fetchTaskStatus = async () => {
      setLoading(true);
      try {
        // <<< INICIO DE LA CORRECCIÓN CRÍTICA: Se quita '/api' de la llamada >>>
        // ANTES: const response = await api.get('/api/tasks/status');
        const response = await api.get('/tasks/status');
        // <<< FIN DE LA CORRECCIÓN CRÍTICA >>>
        setTaskStatus(response.data);
      } catch (err) {
        console.error("Error al cargar el estado de las tareas:", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Solo fetcheamos si tenemos un usuario, para evitar llamadas innecesarias
    if (user) {
        fetchTaskStatus();
    } else {
        setLoading(false);
    }
  }, [user]);

  const handleClaimSuccess = (updatedUser) => {
    updateUser(updatedUser);
    // Para reflejar el cambio en 'claimedTasks', volvemos a fetchear el estado.
    // <<< CORRECCIÓN APLICADA TAMBIÉN AQUÍ >>>
    api.get('/tasks/status').then(res => setTaskStatus(res.data));
  };
  
  if (loading) {
    return (
        <div className="w-full space-y-4 bg-dark-secondary p-4 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white text-center mb-2">Centro de Tareas</h2>
            <div className="h-16 bg-dark-primary rounded-xl animate-pulse"></div>
            <div className="h-16 bg-dark-primary rounded-xl animate-pulse"></div>
            <div className="h-16 bg-dark-primary rounded-xl animate-pulse"></div>
        </div>
    );
  }

  // Si no hay estado de tareas (por un error o porque no hay usuario), no mostramos nada.
  if (!taskStatus) {
      return null;
  }

  return (
    <div className="w-full space-y-4 bg-dark-secondary p-4 rounded-2xl border border-white/10">
      <h2 className="text-xl font-bold text-white text-center mb-2">Centro de Tareas</h2>
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {allTasks.map(task => {
          const isClaimed = taskStatus.claimedTasks?.[task.id] || false;
          // Usamos optional chaining para evitar errores si 'canClaim' no existe
          const isCompleted = taskStatus.canClaim?.[task.id] || false;
          
          return (
            <TaskItem
              key={task.id}
              task={task}
              isClaimed={isClaimed}
              isCompleted={isCompleted && !isClaimed}
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