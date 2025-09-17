// frontend/hooks/useTaskLogic.js (NEXUS DATA SHAPE FIX v23.2 - COMPLETO)
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';

export const useTaskLogic = () => {
  const { updateUser } = useUserStore();
  // --- INICIO DE CORRECCIÓN 1 ---
  // Se inicializa el estado con un array vacío [] en lugar de null.
  // Esto hace que el hook sea más seguro y previene errores en el primer renderizado.
  const [taskStatus, setTaskStatus] = useState([]);
  // --- FIN DE CORRECCIÓN 1 ---
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Esta función es la ÚNICA fuente de verdad para el estado de las tareas.
   * Pide al backend el estado real y lo guarda.
   */
  const fetchTaskStatus = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setIsLoading(true);
    }
    try {
      const { data } = await api.get('/tasks/status');

      // --- INICIO DE CORRECCIÓN 2: TRANSFORMACIÓN DE DATOS ---
      // Se verifica si la respuesta del backend es un objeto o un array.
      // Si es un objeto, se transforma en un array de sus valores.
      // Si ya es un array, se usa directamente.
      // Esto hace que el hook sea robusto y siempre funcione, sin importar la respuesta.
      const tasksArray = Array.isArray(data) ? data : Object.values(data);
      setTaskStatus(tasksArray);
      // --- FIN DE CORRECCIÓN 2 ---

    } catch (error) {
      console.error("Error fetching task status:", error);
      toast.error("No se pudo actualizar el estado de las tareas.");
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  }, []);

  // Carga inicial al montar el componente.
  useEffect(() => {
    fetchTaskStatus(true);
  }, [fetchTaskStatus]);


  const handleGoToTask = async (task) => {
    if (task.id === 'joinedTelegram' && task.link) {
      const toastId = toast.loading('Marcando como visitado...');
      window.open(task.link, '_blank', 'noopener,noreferrer');
      
      try {
        await api.post('/tasks/mark-as-visited', { taskId: 'joinedTelegram' });
        // Volvemos a pedir el estado verificado al servidor.
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

      // Actualizamos el balance del usuario inmediatamente.
      updateUser(data.user);
      
      // Volvemos a pedir el estado verificado de las tareas al servidor.
      await fetchTaskStatus();

      toast.success(data.message || '¡Recompensa reclamada!', { id: toastId });

    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo reclamar la tarea.', { id: toastId });
    }
  };

  // Se devuelve la propiedad con el nombre 'tasks' para que coincida con TaskCenter.jsx
  return {
    tasks: taskStatus,
    isLoading,
    handleGoToTask,
    handleClaimTask,
  };
};