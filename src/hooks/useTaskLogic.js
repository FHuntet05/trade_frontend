// frontend/hooks/useTaskLogic.js (LIMPIEZA Y VERIFICACIÓN FÉNIX v23.0)
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';

export const useTaskLogic = () => {
  const { updateUser } = useUserStore();
  const [taskStatus, setTaskStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * JUSTIFICACIÓN DEL FRACASO v22.0 (FRONTEND): El error catastrófico fue la manipulación
   * optimista y local del estado. El código anterior hacía algo como:
   * `setTaskStatus(prev => ({ ...prev, telegramVisited: true }))` justo después de la
   * llamada a la API. Esto creaba una falsa sensación de éxito en la UI, enmascarando
   * que el backend fallaba al guardar los datos. Al recargar, la verdad de la base de
   * datos (que no había cambiado) volvía, y el estado se perdía.
   *
   * SOLUCIÓN FÉNIX v23.0: `fetchTaskStatus` es ahora nuestra ÚNICA fuente de verdad.
   * No se manipula el estado localmente. Se le pide al backend indestructible que nos
   * diga cuál es el estado real DESPUÉS de cada operación. La UI es un reflejo, no una suposición.
   */
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

  // Carga inicial al montar el componente. Obtiene la verdad desde el servidor.
  useEffect(() => {
    fetchTaskStatus(true);
  }, [fetchTaskStatus]);


  const handleGoToTask = async (task) => {
    if (task.id === 'joinedTelegram' && task.link) {
      const toastId = toast.loading('Marcando como visitado...');
      window.open(task.link, '_blank', 'noopener,noreferrer');
      
      try {
        // 1. Enviar la orden al backend.
        await api.post('/tasks/mark-as-visited', { taskId: 'joinedTelegram' });
        
        // 2. CORRECTO: No asumimos nada. Le preguntamos al servidor cuál es la nueva verdad.
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
      // 1. Enviar la orden de reclamación al backend.
      const { data } = await api.post('/tasks/claim', { taskId });

      // 2. Actualizamos el estado global del usuario (balance) con la respuesta inmediata.
      updateUser(data.user);
      
      // 3. CORRECTO: La tarea fue reclamada. Para actualizar el botón a "Reclamado",
      // volvemos a pedir el estado completo y verificado de las tareas al servidor.
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