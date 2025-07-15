// frontend/src/hooks/useTaskLogic.js (COMPLETO Y FINAL)
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

export const useTaskLogic = () => {
  const { user, updateUser } = useUserStore();
  const [taskStatus, setTaskStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTaskStatus = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const response = await api.get('/tasks/status');
      setTaskStatus(response.data);
    } catch (err) { console.error("Error al cargar estado de tareas:", err); }
    finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => { fetchTaskStatus(); }, [fetchTaskStatus]);

  const handleClaimSuccess = (updatedUser) => {
    updateUser(updatedUser);
    fetchTaskStatus();
  };

  const handleGoToTask = async (task) => {
    // Para tareas que solo navegan dentro de la app
    if (task.id === 'boughtUpgrade') return navigate('/tools');
    if (task.id === 'invitedTenFriends') return navigate('/team');

    // Lógica específica para la tarea del canal de Telegram
    if (task.id === 'joinedTelegram' && task.link && !taskStatus.claimedTasks.joinedTelegram) {
      toast.loading('Abriendo canal...', { id: 'task-go' });
      try {
        await api.post('/tasks/mark-as-visited', { taskName: task.id });
        setTaskStatus(prev => ({
          ...prev,
          claimedTasks: { ...prev.claimedTasks, joinedTelegramAttempt: true }
        }));
        window.Telegram.WebApp.openTelegramLink(task.link);
        toast.dismiss('task-go');
      } catch (error) {
        toast.error(error.response?.data?.message || 'No se pudo procesar la acción.', { id: 'task-go' });
      }
    }
  };

  const handleClaimTask = async (task) => {
    toast.loading('Reclamando recompensa...', { id: `task-claim-${task.id}` });
    try {
      const response = await api.post('/tasks/claim', { taskName: task.id });
      toast.success(response.data.message || '¡Recompensa reclamada!', { id: `task-claim-${task.id}` });
      handleClaimSuccess(response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo reclamar la recompensa.', { id: `task-claim-${task.id}` });
    }
  };

  return { taskStatus, isLoading, handleClaimTask, handleGoToTask };
};