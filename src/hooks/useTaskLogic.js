// frontend/hooks/useTaskLogic.js (CÓDIGO COMPLETO Y CORREGIDO FINALMENTE)
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';

export const useTaskLogic = () => {
  const { updateUser } = useUserStore();
  const [taskStatus, setTaskStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Esta función es estable para una carga inicial
  const fetchTaskStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks/status');
      setTaskStatus(data);
    } catch (error) {
      console.error("Error fetching task status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTaskStatus();
  }, [fetchTaskStatus]);

  // Esta versión es para refrescos silenciosos y robustos
  const fetchTaskStatusSilently = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks/status');
      setTaskStatus(data);
    } catch (error) {
      console.error("Silent fetch failed:", error);
    }
  }, []);

  const handleGoToTask = async (task) => {
    if (task.id === 'joinedTelegram' && task.link) {
      const toastId = toast.loading('Marcando como visitado...');
      window.open(task.link, '_blank', 'noopener,noreferrer');
      
      try {
        await api.post('/tasks/mark-as-visited', { taskId: 'joinedTelegram' });
        await fetchTaskStatusSilently();
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
      toast.success(data.message || '¡Recompensa reclamada!', { id: toastId });

      // === INICIO DE LA CORRECCIÓN CRÍTICA Y DEFINITIVA ===
      // En lugar de depender de un re-fetch que puede fallar o ser lento,
      // actualizamos el estado local de forma MANUAL e INSTANTÁNEA.
      // Esto garantiza que la UI reaccione inmediatamente y desactive el botón.
      setTaskStatus(prevStatus => ({
        ...prevStatus, // Copia el estado anterior
        claimedTasks: {
          ...prevStatus.claimedTasks, // Copia las tareas ya reclamadas
          [taskId]: true // Marca la tarea actual como reclamada
        }
      }));
      // === FIN DE LA CORRECCIÓN CRÍTICA Y DEFINITIVA ===

    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo reclamar la tarea.', { id: toastId });
    }
  };

  return {
    taskStatus,
    isLoading,
    handleGoToTask,
    handleClaimTask,
  };
};