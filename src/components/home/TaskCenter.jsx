// frontend/src/components/home/TaskCenter.jsx (COMPLETO Y FINAL)
import React from 'react';
import { motion } from 'framer-motion';
import { useTaskLogic } from '../../hooks/useTaskLogic';
import useUserStore from '../../store/userStore';
import TaskItem from '../tasks/TaskItem';

const TaskCenter = () => {
  const { user } = useUserStore();
  const { taskStatus, isLoading, handleClaimTask, handleGoToTask } = useTaskLogic();

  const allTasks = [
    { id: 'boughtUpgrade', title: 'Primera Mejora', description: 'Compra cualquier herramienta VIP.', reward: 1500 },
    { id: 'invitedTenFriends', title: 'Invitar 3 Amigos', description: 'Tu equipo debe tener 3 miembros.', reward: 1000 },
    { id: 'joinedTelegram', title: 'Unirse al Canal', description: 'Únete a nuestra comunidad oficial.', reward: 500, link: 'https://t.me/feft05' },
  ];

  if (isLoading) {
    return (
        <div className="w-full space-y-4 bg-dark-secondary p-4 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white text-center mb-2">Centro de Tareas</h2>
            <div className="h-16 bg-dark-primary rounded-xl animate-pulse"></div>
            <div className="h-16 bg-dark-primary rounded-xl animate-pulse"></div>
            <div className="h-16 bg-dark-primary rounded-xl animate-pulse"></div>
        </div>
    );
  }

  if (!taskStatus || !user) {
      return null;
  }
  
  const isTaskCompletable = (task) => {
    if (taskStatus.claimedTasks[task.id]) return false;
    
    switch (task.id) {
        case 'boughtUpgrade':
            return user.activeTools && user.activeTools.length > 0;
        case 'invitedTenFriends':
            return taskStatus.referralCount >= 3;
        case 'joinedTelegram':
            return taskStatus.claimedTasks.joinedTelegramAttempt === true;
        default:
            return false;
    }
  };

  return (
    <div className="w-full space-y-4 bg-dark-secondary p-4 rounded-2xl border border-white/10">
      <h2 className="text-xl font-bold text-white text-center mb-2">Centro de Tareas</h2>
      <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {allTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            isClaimed={taskStatus.claimedTasks[task.id] || false}
            isCompleted={isTaskCompletable(task)}
            referralCount={taskStatus.referralCount || 0}
            onGoToTask={handleGoToTask}
            onClaim={handleClaimTask} // <-- Pasamos la función de reclamar
          />
        ))}
      </motion.div>
    </div>
  );
};

export default TaskCenter;