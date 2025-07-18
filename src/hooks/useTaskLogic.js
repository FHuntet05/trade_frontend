// frontend/src/hooks/useTaskLogic.js
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';

export const useTaskLogic = () => {
  const { updateUser } = useUserStore();
  const [taskStatus, setTaskStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTaskStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks/status');
      setTaskStatus(data);
    } catch (error) {
      console.error("Error fetching task status:", error);
      toast.error('No se pudo cargar el estado de las tareas.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTaskStatus();
  }, [fetchTaskStatus]);

  const handleGoToTask = async (task) => {
    if (task.id === 'joinedTelegram' && task.link) {
      // Abre el enlace en una nueva pestaña
      window.open(task.link, '_blank', 'noopener,noreferrer');
      
      // Notifica al backend que el usuario ha hecho clic
      try {
        const { data } = await api.post('/tasks/mark-as-visited', { taskId: 'joinedTelegram' });
        toast.success('¡Vuelve para reclamar tu recompensa!');
        // Actualiza el estado local inmediatamente para que la UI reaccione
        setTaskStatus(data.taskStatus);
      } catch (error) {
        console.error("Error marking task as visited:", error);
        toast.error(error.response?.data?.message || 'Algo salió mal.');
      }
    }
  };

  const handleClaimTask = async (taskId) => {
    const toastId = toast.loading('Reclamando recompensa...');
    try {
      const { data } = await api.post('/tasks/claim', { taskId });
      // El backend devuelve el usuario completo y actualizado.
      // Lo usamos para actualizar nuestro store global.
      updateUser(data.user); 
      await fetchTaskStatus(); // Volvemos a pedir el estado de las tareas
      toast.success('¡Recompensa reclamada!', { id: toastId });
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