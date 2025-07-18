// frontend/src/hooks/useTaskLogic.js (FLUJO CORREGIDO v21.19)
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

  const handleGoToTask = (task) => {
    if (task.id === 'boughtUpgrade') return navigate('/tools');
    if (task.id === 'invitedTenFriends') return navigate('/team');

    // --- INICIO DE LA CORRECCIÓN DE LÓGICA DE TAREA ---
    if (task.id === 'joinedTelegram' && task.link && !taskStatus?.isCompleted?.joinedTelegram) {
      // 1. Abrir el enlace INMEDIATAMENTE. Esta es la única acción que depende del clic directo del usuario.
      window.Telegram.WebApp.openTelegramLink(task.link);

      // 2. Realizar la llamada a la API en segundo plano para notificar al backend.
      // No usamos toast.promise para no bloquear.
      api.post('/tasks/mark-as-visited', { taskName: task.id })
        .then(response => {
          // 3. Actualizamos el estado local para que el botón "Reclamar" aparezca al volver,
          //    sin necesidad de un refresh completo.
          console.log(response.data.message); // Log para depuración
          setTaskStatus(prev => ({
            ...prev,
            isCompleted: { ...prev.isCompleted, joinedTelegram: true }
          }));
        })
        .catch(error => {
          console.error("Error al marcar la tarea como visitada:", error);
          toast.error('No se pudo verificar la visita, pero puedes intentar reclamar la tarea si te uniste al canal.');
        });
    }
    // --- FIN DE LA CORRECCIÓN DE LÓGICA DE TAREA ---
  };

  const handleClaimTask = async (task) => {
    const claimPromise = api.post('/tasks/claim', { taskName: task.id });
    
    toast.promise(claimPromise, {
      loading: 'Reclamando recompensa...',
      success: (response) => {
        handleClaimSuccess(response.data.user);
        return response.data.message || '¡Recompensa reclamada!';
      },
      error: (err) => err.response?.data?.message || 'No se pudo reclamar la recompensa.',
    });
  };

  return { taskStatus, isLoading, handleClaimTask, handleGoToTask };
};