// frontend/hooks/useTaskLogic.js (SINCRONIZACIÓN DE CONTRATO FÉNIX v23.1)
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';

export const useTaskLogic = () => {
  const { updateUser } = useUserStore();
  const [taskStatus, setTaskStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTaskStatus = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setIsLoading(true);
    }
    try {
      const { data } = await api.get('/tasks/status');
      setTaskStatus(data);
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
    if (task.id === 'joinedTelegram' && task.link) {
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

  // --- INICIO DE LA CORRECCIÓN CRÍTICA ---
  // Se cambia el nombre de la propiedad devuelta de 'taskStatus' a 'tasks'.
  // Esto alinea el "contrato" del hook con lo que el componente 'TaskCenter' espera.
  return {
    tasks: taskStatus, // <- ANTES: taskStatus
    isLoading,
    handleGoToTask,
    handleClaimTask,
  };
  // --- FIN DE LA CORRECCIÓN CRÍTICA ---
};