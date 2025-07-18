// frontend/hooks/useTaskLogic.js (CÓDIGO COMPLETO Y CORREGIDO)
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';

export const useTaskLogic = () => {
  const { updateUser } = useUserStore();
  const [taskStatus, setTaskStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTaskStatus = useCallback(async () => {
    // No mostramos el loader en cada re-fetch, solo en la carga inicial
    // setIsLoading(true); // Esto se comenta para evitar parpadeos
    try {
      const { data } = await api.get('/tasks/status');
      setTaskStatus(data);
    } catch (error) {
      console.error("Error fetching task status:", error);
      toast.error('No se pudo cargar el estado de las tareas.');
    } finally {
      // Solo desactivamos el loader grande la primera vez
      if (isLoading) setIsLoading(false);
    }
  }, [isLoading]); // Dependencia 'isLoading' añadida

  useEffect(() => {
    fetchTaskStatus();
  }, [fetchTaskStatus]);

  const handleGoToTask = async (task) => {
    if (task.id === 'joinedTelegram' && task.link) {
      const toastId = toast.loading('Marcando como visitado...');
      window.open(task.link, '_blank', 'noopener,noreferrer');
      
      try {
        await api.post('/tasks/mark-as-visited', { taskId: 'joinedTelegram' });
        
        // === INICIO DE LA CORRECCIÓN CRÍTICA ===
        // Cerramos el bucle: Tras el éxito, volvemos a pedir el estado actualizado.
        // Esto refrescará la UI y mostrará el botón "Reclamar".
        await fetchTaskStatus();
        // === FIN DE LA CORRECCIÓN CRÍTICA ===

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
      
      // Volvemos a pedir el estado de las tareas para actualizar el botón a "Reclamado"
      await fetchTaskStatus(); 

      toast.success(data.message || '¡Recompensa reclamada!', { id: toastId });
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