// frontend/src/pages/HomePage.jsx (CÓDIGO COMPLETO CON LOGGING)
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
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
    // === LOG: RASTREO DE EJECUCIÓN DEL useEffect ===
    console.log(`[HomePage] useEffect disparado. ¿Ya inicializado? -> ${hasInitialized.current}`);

    if (hasInitialized.current) {
      console.log("[HomePage] Inicialización ya realizada. Saltando.");
      return;
    }
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

      // === LOG: DATOS A PUNTO DE SER ENVIADOS ===
      console.log(`[HomePage] Preparando para llamar a syncUserWithBackend. Usuario: ${telegramUser.id}, RefCode: ${refCode}`);
      await syncUserWithBackend(telegramUser, refCode);
    };

    initialize();
  }, [syncUserWithBackend, location.search]);

  // Se mantiene la lógica de renderizado condicional
  if (isLoadingAuth || !isAuthenticated) {
    // Si isLoadingAuth es true, muestra el loader.
    // Si después de la carga, isAuthenticated es false, UserAppShell lo manejará.
    // Este componente no debería renderizar su contenido principal hasta que la auth esté completa.
    // El UserAppShell ya se encarga de esto, pero mantenemos un loader local por si acaso.
     return (
          <div className="w-full min-h-screen flex items-center justify-center bg-dark-primary">
              <Loader text="Sincronizando..." />
          </div>
      );
  }

  // A partir de aquí, el código asume que 'user' existe y es válido.
  const lastClaim = user?.lastMiningClaim;
  const miningRate = user?.effectiveMiningRate ?? 0;
  const miningStatus = user?.miningStatus ?? 'IDLE'; 
  
  const { accumulatedNtx, countdown, progress, buttonState } = useMiningLogic(
    lastClaim,
    miningRate,
    miningStatus
  );

  const handleStartMining = async () => {
    toast.loading('Iniciando ciclo...', { id: 'mining_control' });
    try {
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
      const response = await api.post('/wallet/claim');
      updateUser(response.data.user);
      toast.success(response.data.message, { id: 'mining_control' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al reclamar.';
      toast.error(errorMessage, { id: 'mining_control' });
    }
  };

  const renderControlButton = () => {
    switch (buttonState) {
      case 'SHOW_START':
        return <button onClick={handleStartMining} className="w-full py-4 bg-blue-500 text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all">INICIAR</button>;
      case 'SHOW_CLAIM':
        return <button onClick={handleClaim} className="w-full py-4 bg-gradient-to-r from-accent-start to-accent-end text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all">RECLAMAR GANANCIAS</button>;
      case 'HIDDEN':
      default:
        return null; 
    }
  };
  
  const shouldShowButton = buttonState === 'SHOW_START' || buttonState === 'SHOW_CLAIM';

  return (
    <div className="flex flex-col h-full animate-fade-in gap-4 overflow-y-auto pb-4">
      <div className="px-4 pt-4 space-y-4">
        <UserInfoHeader />
        <RealTimeClock />
      </div>

      <div className="flex flex-col items-center justify-center text-center px-4">
        <video src="/assets/mining-animation.webm" autoPlay loop muted playsInline className="w-48 h-48 sm:w-52 sm:h-52 mx-auto" />
        <AnimatedCounter value={parseFloat(accumulatedNtx.toFixed(2))} />
        
        <div className="w-full max-w-xs mx-auto mt-4 space-y-3">
          <div className="w-full bg-dark-secondary rounded-full h-6 shadow-inner overflow-hidden">
            <div 
              className="bg-gradient-to-r from-accent-start to-accent-end h-6 rounded-full transition-all duration-1000" 
              style={{width: `${progress}%`}}
            />
          </div>
          <p className="text-text-secondary text-base font-mono">{countdown}</p>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col px-4 space-y-4">
        <div className="w-full h-16 flex items-center justify-center">
          {renderControlButton()}
        </div>
      
        <div className={!shouldShowButton ? 'flex-grow' : ''}>
          <TaskCenter />
        </div>
        
        <NotificationFeed />
      </div>
    </div>
  );
};

export default HomePage;