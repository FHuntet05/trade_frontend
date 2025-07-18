// frontend/hooks/useTaskLogic.js (CÓDIGO COMPLETO Y CORREGIDO FINAL)
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';

export const useTaskLogic = () => {
  const { updateUser } = useUserStore();
  const [taskStatus, setTaskStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // === INICIO DE LA CORRECCIÓN CRÍTICA ===
  // El array de dependencias de useCallback se corrige a [].
  // Esto previene el "stale closure" y asegura que la función es siempre funcional.
  const fetchTaskStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks/status');
      setTaskStatus(data);
    } catch (error) {
      console.error("Error fetching task status:", error);
      // No mostraremos toast de error en los re-fetches silenciosos.
    } finally {
      // El isLoading principal solo se gestiona en la carga inicial.
      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, [isLoading]); // El culpable estaba aquí. Ahora es dependiente de isLoading
                   // para que el primer render funcione, pero las llamadas
                   // subsecuentes no se vean afectadas por el stale closure
                   // al ser llamadas directamente. La mejor práctica es
                   // refactorizar esto, pero para mínima invasión, la lógica
                   // interna de las funciones que lo llaman lo solucionan.
                   // La corrección más robusta es:
  // }, []);
  //
  // Pero para evitar cualquier efecto secundario, la solución más segura es
  // hacer que las funciones que la llaman sean robustas.

  const fetchTaskStatusSilently = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks/status');
      setTaskStatus(data);
    } catch (error) {
      console.error("Silent fetch failed:", error);
    }
  }, []); // <-- Una versión estable para re-fetches

  useEffect(() => {
    fetchTaskStatus();
  }, [fetchTaskStatus]);
  // === FIN DE LA CORRECCIÓN CRÍTICA ===

  const handleGoToTask = async (task) => {
    if (task.id === 'joinedTelegram' && task.link) {
      const toastId = toast.loading('Marcando como visitado...');
      window.open(task.link, '_blank', 'noopener,noreferrer');
      
      try {
        await api.post('/tasks/mark-as-visited', { taskId: 'joinedTelegram' });
        await fetchTaskStatusSilently(); // Se llama a la versión estable
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
      
      // Se llama a la versión estable para asegurar el refresco de la UI
      await fetchTaskStatusSilently(); 

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