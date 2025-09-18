// RUTA: frontend/src/components/home/TaskCenter.jsx (VERSIÓN NEXUS - REFACTORIZADA)
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTaskLogic } from '../../hooks/useTaskLogic'; 
import TaskItem from '../tasks/TaskItem';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-xl font-bold text-white px-2">{t('tasks.title', 'Centro de Tareas')}</h2>
      {taskList.map(task => {
        // Obtenemos las traducciones y las fusionamos con los datos de la tarea
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
              task={translatedTask} // Se pasa el objeto completo y unificado
              onGoToTask={handleGoToTask}
              onClaim={handleClaimTask}
          />
        );
      })}
    </motion.div>
  );
};

export default TaskCenter;