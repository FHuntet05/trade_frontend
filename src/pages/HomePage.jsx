// frontend/src/pages/HomePage.jsx (CÓDIGO RECONSTRUIDO PARA ELIMINAR BUCLES)
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
  // useRef es la clave para evitar ejecuciones múltiples. Es el "blindaje".
  const hasInitialized = useRef(false);

  // =======================================================================
  // === EL EFECTO DE SINCRONIZACIÓN ÚNICA (SOLUCIÓN AL BUCLE INFINITO) ===
  // =======================================================================
  useEffect(() => {
    // Si ya se inicializó, no hacer nada. Esto previene el bucle.
    if (hasInitialized.current) {
      console.log("[HomePage] Inicialización ya realizada. Saltando ejecución de useEffect.");
      return;
    }
    hasInitialized.current = true; // Marcar como inicializado inmediatamente.

    const initializeUserSession = async () => {
      console.log("[HomePage] Iniciando sesión de usuario...");
      const tg = window.Telegram?.WebApp;

      if (!tg || !tg.initDataUnsafe?.user) {
        console.error("[HomePage] FATAL: El objeto de Telegram (WebApp) no está disponible. No se puede sincronizar.");
        // Opcionalmente, podrías forzar un logout o un estado de error aquí.
        // useUserStore.getState().logout(); 
        return;
      }

      const telegramUser = tg.initDataUnsafe.user;
      const searchParams = new URLSearchParams(location.search);
      const refCode = searchParams.get('ref'); // Lee el parámetro 'ref' que nos pasó el Interceptor.

      console.log(`[HomePage] Datos para sincronización: Usuario TG ID: ${telegramUser.id}, Código de Referido: ${refCode}`);
      await syncUserWithBackend(telegramUser, refCode);
    };

    initializeUserSession();
    
  }, [syncUserWithBackend, location.search]); // Dependencias correctas

  // Mientras isLoadingAuth es true, UserAppShell ya muestra un loader.
  // Este es un fallback por si HomePage se renderiza antes del shell.
  // La condición principal es !isAuthenticated. Si después de cargar, no está autenticado,
  // el UserAppShell mostrará la pantalla de error. Por tanto, aquí no es necesario
  // renderizar nada si !isAuthenticated.
  if (!user || !isAuthenticated) {
     // El UserAppShell ya maneja el estado de carga y error. 
     // Devolver null aquí es seguro, ya que el Shell mostrará el Loader o el AuthErrorScreen.
    return null; 
  }

  // A partir de aquí, el CÓDIGO ES SEGURO. 'user' existe y es válido.
  const { 
    accumulatedNtx, 
    countdown, 
    progress, 
    buttonState 
  } = useMiningLogic(
    user.lastMiningClaim,
    user.effectiveMiningRate,
    user.miningStatus
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
      default:
        return null; 
    }
  };
  
  const shouldShowButton = buttonState !== 'HIDDEN';

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