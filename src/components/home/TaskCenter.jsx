// RUTA: frontend/src/components/home/TaskCenter.jsx (VERSIÓN "NEXUS - DEFENSIVE FIX")

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTaskLogic } from '../../hooks/useTaskLogic'; 
import TaskItem from '../tasks/TaskItem';
import { motion } from 'framer-motion';

const TaskCenter = () => {
  const { t } = useTranslation();
  const { tasks, isLoading, handleClaimTask, handleGoToTask } = useTaskLogic();

  if (isLoading) {
      return (
        <div className="w-full space-y-3">
          <div className="h-24 bg-dark-secondary/50 rounded-2xl animate-pulse"></div>
          <div className="h-24 bg-dark-secondary/50 rounded-2xl animate-pulse"></div>
        </div>
      );
  }
  
  // [NEXUS DEFENSIVE FIX] - CORRECCIÓN CRÍTICA
  // Se utiliza un "array de fallback". Si `tasks` es undefined o null, se usará un array vacío `[]`.
  // Esto previene el error `undefined.map` y asegura que el componente nunca crashee.
  const taskList = tasks || [];

  if (taskList.length === 0) {
      return (
          <div className="bg-dark-secondary/70 backdrop-blur-md rounded-2xl p-6 text-center text-text-secondary border border-white/10">
              <p>{t('tasks.noTasks', 'No hay tareas disponibles en este momento.')}</p>
          </div>
      );
  }
  
  return (
    <motion.div 
      className="space-y-3" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {taskList.map(task => {
        const translatedTask = {
          ...task,
          title: t(`tasks.${task.taskId}.title`), 
          description: t(`tasks.${task.taskId}.description`, { 
            count: task.target 
          }),
        };
        
        return (
          <TaskItem
              key={task.taskId}
              task={translatedTask}
              onGoToTask={handleGoToTask}
              onClaim={handleClaimTask}
          />
        );
      })}
    </motion.div>
  );
};

export default TaskCenter;