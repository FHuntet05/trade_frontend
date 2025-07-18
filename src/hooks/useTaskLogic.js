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
    fetchTaskStatus(); // Refrescamos el estado de las tareas
  };

  const handleGoToTask = async (task) => {
    if (task.id === 'boughtUpgrade') return navigate('/tools');
    if (task.id === 'invitedTenFriends') return navigate('/team');

    // --- INICIO DE LA CORRECCIÓN DE LÓGICA DE TAREA ---
    if (task.id === 'joinedTelegram' && task.link && !taskStatus.isCompleted.joinedTelegram) {
      // 1. Mostrar un loader para que el usuario sepa que algo está pasando.
      const actionPromise = api.post('/tasks/mark-as-visited', { taskName: task.id });
      
      toast.promise(actionPromise, {
        loading: 'Verificando y abriendo canal...',
        success: (response) => {
          // 2. Si la API responde correctamente, abrimos el enlace.
          window.Telegram.WebApp.openTelegramLink(task.link);
          // 3. Actualizamos el estado local INMEDIATAMENTE para que el botón "Reclamar" aparezca
          //    sin necesidad de esperar a que el usuario vuelva y se refresque la página.
          setTaskStatus(prev => ({
            ...prev,
            isCompleted: { ...prev.isCompleted, joinedTelegram: true }
          }));
          return response.data.message || '¡Listo para reclamar!';
        },
        error: (err) => err.response?.data?.message || 'No se pudo procesar la acción.',
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