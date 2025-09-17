// frontend/hooks/useTaskLogic.js (NEXUS DATA SANITIZATION v23.3 - COMPLETO)
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';

export const useTaskLogic = () => {
  const { updateUser } = useUserStore();
  const [taskStatus, setTaskStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTaskStatus = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setIsLoading(true);
    }
    try {
      const { data } = await api.get('/tasks/status');
      
      const tasksArray = Array.isArray(data) ? data : Object.values(data);

      // --- INICIO DE LA CORRECCIÓN CRÍTICA: SANITIZACIÓN DE DATOS ---
      // Se añade un filtro para eliminar cualquier tarea que no tenga un 'taskId'.
      // 'taskId' es la propiedad esencial para renderizar y traducir la tarea.
      // Si una tarea no tiene ID, es inválida y se descarta.
      // Esto previene tanto el error de i18next como el TypeError.
      const sanitizedTasks = tasksArray.filter(task => task && task.taskId);
      setTaskStatus(sanitizedTasks);
      // --- FIN DE LA CORRECCIÓN CRÍTICA ---

    } catch (error) {
      console.error("Error fetching task status:", error);
      toast.error("No se pudo actualizar el estado de las tareas.");
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchTaskStatus(true);
  }, [fetchTaskStatus]);


  const handleGoToTask = async (task) => {
    if (task.taskId === 'joinedTelegram' && task.link) { // Corregido de task.id a task.taskId por consistencia
      const toastId = toast.loading('Marcando como visitado...');
      window.open(task.link, '_blank', 'noopener,noreferrer');
      
      try {
        await api.post('/tasks/mark-as-visited', { taskId: 'joinedTelegram' });
        await fetchTaskStatus();
        toast.success('¡Vuelve para reclamar tu recompensa!', { id: toastId });
      } catch (error) {
        console.error("Error marking task as visited:", error);
        toast.error(error.response?.data?.message || 'Algo salió mal.', { id: toastId });
      }
    }
  };

  const handleClaimTask = async (taskId) => {
    const toastId = toast.loading('Reclamando recompensa...');
    try {
      const { data } = await api.post('/tasks/claim', { taskId });
      updateUser(data.user);
      await fetchTaskStatus();
      toast.success(data.message || '¡Recompensa reclamada!', { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo reclamar la tarea.', { id: toastId });
    }
  };

  return {
    tasks: taskStatus,
    isLoading,
    handleGoToTask,
    handleClaimTask,
  };
};