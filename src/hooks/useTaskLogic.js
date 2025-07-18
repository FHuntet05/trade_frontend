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

     // --- INICIO DE LA CORRECCIÓN DE LÓGICA ---
    if (task.id === 'joinedTelegram' && task.link && !taskStatus.claimedTasks.joinedTelegram) {
      // 1. Abrir el enlace de Telegram INMEDIATAMENTE para una respuesta rápida.
      window.Telegram.WebApp.openTelegramLink(task.link);
      
      // 2. Realizar la llamada a la API en segundo plano sin bloquear al usuario.
      try {
        await api.post('/tasks/mark-as-visited', { taskName: task.id });
        // Actualizamos el estado local para reflejar el intento.
        setTaskStatus(prev => ({
          ...prev,
          claimedTasks: { ...prev.claimedTasks, joinedTelegramAttempt: true }
        }));
      } catch (error) {
        // Si la llamada en segundo plano falla, informamos al usuario, pero no es un error bloqueante.
        console.error("Error al marcar la tarea como visitada:", error);
        toast.error('No se pudo verificar la visita, pero puedes intentar reclamar la tarea si te uniste al canal.');
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