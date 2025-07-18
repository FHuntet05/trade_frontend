// frontend/hooks/useTaskLogic.js (CÓDIGO COMPLETO Y CORREGIDO)
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';

export const useTaskLogic = () => {
  const { updateUser } = useUserStore();
  const [taskStatus, setTaskStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función unificada para obtener el estado de las tareas.
  // Es la única fuente de verdad para actualizar la UI.
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

  // Carga inicial al montar el componente
  useEffect(() => {
    fetchTaskStatus(true);
  }, [fetchTaskStatus]);


  const handleGoToTask = async (task) => {
    if (task.id === 'joinedTelegram' && task.link) {
      const toastId = toast.loading('Marcando como visitado...');
      window.open(task.link, '_blank', 'noopener,noreferrer');
      
      try {
        await api.post('/tasks/mark-as-visited', { taskId: 'joinedTelegram' });
        // === INICIO DE LA CORRECCIÓN DEL FLUJO DE DATOS ===
        // Confiamos en que el backend ha guardado el estado.
        // Ahora simplemente pedimos la nueva verdad para refrescar la UI.
        await fetchTaskStatus();
        // === FIN DE LA CORRECCIÓN DEL FLUJO DE DATOS ===
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
      updateUser(data.user); // Actualizamos el usuario global (saldo, etc.)
      
      // === INICIO DE LA CORRECCIÓN DEL FLUJO DE DATOS ===
      // El backend ha guardado el estado "reclamado".
      // Pedimos la nueva verdad para que la UI muestre el botón como desactivado.
      await fetchTaskStatus();
      // === FIN DE LA CORRECCIÓN DEL FLUJO DE DATOS ===

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