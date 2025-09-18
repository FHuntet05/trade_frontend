// RUTA: frontend/hooks/useTaskLogic.js (VERSIÓN NEXUS - SINCRONIZACIÓN DE ESTADO FIJA)
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate

export const useTaskLogic = () => {
  const { updateUser } = useUserStore();
  const [taskStatus, setTaskStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // Inicializamos useNavigate

  const fetchTaskStatus = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true);
    try {
      const { data } = await api.get('/tasks/status');
      const tasksArray = Array.isArray(data) ? data : Object.values(data);
      const sanitizedTasks = tasksArray.filter(task => task && task.taskId);
      setTaskStatus(sanitizedTasks);
    } catch (error) {
      console.error("Error fetching task status:", error);
      toast.error("No se pudo actualizar el estado de las tareas.");
    } finally {
      if (isInitialLoad) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTaskStatus(true);
  }, [fetchTaskStatus]);

  /**
   * @desc Maneja la acción 'Ir' de una tarea.
   * - Para 'joinedTelegram', ejecuta el auto-reclamo.
   * - Para otras, navega a la página correspondiente.
   */
  const handleGoToTask = async (task) => {
    // ======================= INICIO DE LA CORRECCIÓN CRÍTICA =======================
    // Lógica específica para la tarea de auto-reclamo
    if (task.taskId === 'joinedTelegram') {
        if (task.link) window.open(task.link, '_blank', 'noopener,noreferrer');
        const toastId = toast.loading('Completando tarea...');
        try {
            // 1. Capturamos la respuesta de la API, que contiene el 'user' actualizado.
            const response = await api.post('/tasks/mark-as-visited', { taskId: 'joinedTelegram' });
            
            // 2. Actualizamos el estado global del usuario con los datos de la respuesta.
            //    Esto actualizará el saldo en la UI inmediatamente.
            updateUser(response.data.user);
            
            // 3. Volvemos a pedir el estado de las tareas para que el botón cambie a "Reclamado".
            await fetchTaskStatus();
            
            // 4. Usamos el mensaje de éxito del backend.
            toast.success(response.data.message || '¡Tarea completada!', { id: toastId });

        } catch (error) {
            toast.error(error.response?.data?.message || 'Esta tarea ya fue completada.', { id: toastId });
        }
        return; // Finalizamos la ejecución para esta tarea.
    }
    // ======================== FIN DE LA CORRECCIÓN CRÍTICA =========================

    // Lógica de navegación para las otras tareas con botón "Ir"
    switch(task.taskId) {
        case 'boughtUpgrade':
            toast.info('Navegando a la tienda de mejoras...');
            navigate('/tools');
            break;
        case 'inviteFriends':
            toast.info('Navegando a la página de equipo...');
            navigate('/team');
            break;
        default:
            if (task.link) window.open(task.link, '_blank', 'noopener,noreferrer');
            break;
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