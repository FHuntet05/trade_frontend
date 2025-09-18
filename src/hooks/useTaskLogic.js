// RUTA: frontend/hooks/useTaskLogic.js (VERSIÓN NEXUS - ESTADO REACTIVO INSTANTÁNEO)
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

export const useTaskLogic = () => {
  const { updateUser } = useUserStore();
  const [taskStatus, setTaskStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTaskStatus = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true);
    try {
      const { data } = await api.get('/tasks/status');
      const sanitizedTasks = Array.isArray(data) ? data.filter(task => task && task.taskId) : [];
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

  const handleGoToTask = async (task) => {
    if (task.taskId === 'joinedTelegram') {
      if (task.link) window.open(task.link, 'noopener,noreferrer');
      const toastId = toast.loading('Completando tarea...');
      try {
        const response = await api.post('/tasks/mark-as-visited', { taskId: 'joinedTelegram' });
        
        // 1. Actualizar el estado global del usuario (para el saldo)
        updateUser(response.data.user);
        
        // ======================= CORRECCIÓN DE ESTADO REACTIVO =======================
        // 2. Actualizar el estado local de las tareas INMEDIATAMENTE.
        //    Esto fuerza el cambio del botón a "Reclamado" sin una segunda llamada a la API.
        setTaskStatus(currentTasks =>
            currentTasks.map(t =>
                t.taskId === 'joinedTelegram' ? { ...t, isClaimed: true, status: 'claimed' } : t
            )
        );
        // ======================= FIN DE LA CORRECCIÓN =========================

        toast.success(response.data.message || '¡Tarea completada!', { id: toastId });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Esta tarea ya fue completada.', { id: toastId });
      }
      return;
    }

    switch(task.taskId) {
        case 'boughtUpgrade':
            navigate('/tools');
            break;
        case 'inviteFriends':
            navigate('/team');
            break;
        default:
            if (task.link) window.open(task.link, 'noopener,noreferrer');
            break;
    }
  };

  const handleClaimTask = async (taskId) => {
    const toastId = toast.loading('Reclamando recompensa...');
    try {
      const { data } = await api.post('/tasks/claim', { taskId });

      // 1. Actualizar el estado global del usuario (para el saldo)
      updateUser(data.user);

      // ======================= CORRECCIÓN DE ESTADO REACTIVO =======================
      // 2. Actualizar el estado local de las tareas INMEDIATAMENTE.
      setTaskStatus(currentTasks =>
        currentTasks.map(task =>
          task.taskId === taskId ? { ...task, isClaimed: true, status: 'claimed' } : task
        )
      );
      // ======================= FIN DE LA CORRECCIÓN =========================

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