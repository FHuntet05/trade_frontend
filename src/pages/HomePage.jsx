import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
// CAMBIO 1: Importa nuestra instancia 'api' en lugar de 'axios' genérico.
import api from '../api/axiosConfig';

import UserInfoHeader from '../components/home/UserInfoHeader';
import RealTimeClock from '../components/home/RealTimeClock';
import AnimatedCounter from '../components/home/AnimatedCounter';
import TaskCenter from '../components/home/TaskCenter';
import NotificationFeed from '../components/home/NotificationFeed';
import { useMiningLogic } from '../hooks/useMiningLogic';
import Loader from '../components/common/Loader';

const HomePage = () => {
  const { user, updateUser, syncUserWithBackend, isAuthenticated, isLoadingAuth } = useUserStore();
  const location = useLocation();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initialize = async () => {
      const tg = window.Telegram?.WebApp;
      if (!tg || !tg.initDataUnsafe?.user) {
        console.error("[HomePage] FATAL: Contexto de Telegram no encontrado.");
        return;
      }
      const telegramUser = tg.initDataUnsafe.user;
      const searchParams = new URLSearchParams(location.search);
      const refCode = searchParams.get('ref');
      await syncUserWithBackend(telegramUser, refCode);
    };

    initialize();
  }, [syncUserWithBackend, location.search]);

  if (isLoadingAuth || !isAuthenticated) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-dark-primary">
          <Loader text="Sincronizando..." />
      </div>
    );
  }

  const lastClaim = user?.lastMiningClaim;
  const miningRate = user?.effectiveMiningRate ?? 0;
  const miningStatus = user?.miningStatus ?? 'IDLE'; 
  
  const { accumulatedNtx, countdown, progress, buttonState } = useMiningLogic(lastClaim, miningRate, miningStatus);

  const handleStartMining = async () => {
    toast.loading('Iniciando ciclo...', { id: 'mining_control' });
    try {
      // CAMBIO 2: Usa 'api.post' y una ruta relativa.
      const response = await api.post('/wallet/start-mining');
      updateUser(response.data.user);
      toast.success('¡Ciclo de minado iniciado!', { id: 'mining_control' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al iniciar el ciclo.';
      toast.error(errorMessage, { id: 'mining_control' });
    }
  };

  const handleClaim = async () => {
    toast.loading('Reclamando...', { id: 'mining_control' });
    try {
      // CAMBIO 3: Usa 'api.post' y una ruta relativa.
      const response = await api.post('/wallet/claim');
      updateUser(response.data.user);
      toast.success(response.data.message, { id: 'mining_control' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al reclamar.';
      toast.error(errorMessage, { id: 'mining_control' });
    }
  };

  const renderControlButton = () => { /* ...código sin cambios... */ };
  const shouldShowButton = buttonState === 'SHOW_START' || buttonState === 'SHOW_CLAIM';

  return (
    <div className="flex flex-col h-full animate-fade-in gap-4 overflow-y-auto pb-4">
      {/* ...resto del JSX sin cambios... */}
    </div>
  );
};

export default HomePage;