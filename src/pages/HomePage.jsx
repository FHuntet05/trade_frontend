// frontend/src/pages/HomePage.jsx (CÓDIGO COMPLETO CON LÓGICA DE SINCRONIZACIÓN)
import React, { useEffect } from 'react';
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

const HomePage = () => {
  // Obtenemos las acciones y datos del store
  const { user, updateUser, syncUserWithBackend } = useUserStore();
  const location = useLocation();

  // === INICIO DE LA LÓGICA DE SINCRONIZACIÓN INICIAL ===
  // Este useEffect es la nueva puerta de entrada a la aplicación.
  // Se ejecuta una sola vez cuando la página se carga.
  useEffect(() => {
    const initialize = async () => {
      // 1. Obtenemos los datos del usuario desde el objeto de Telegram
      const tg = window.Telegram?.WebApp;
      if (!tg || !tg.initDataUnsafe?.user) {
        console.error("Contexto de Telegram no disponible. No se puede sincronizar.");
        // Aquí podríamos mostrar un error, pero el UserAppShell ya se encarga
        // de mostrar la pantalla de error si la autenticación falla.
        return;
      }
      const telegramUser = tg.initDataUnsafe.user;

      // 2. Leemos el código de referido de la URL, que fue puesto por nuestro RootInterceptor
      const searchParams = new URLSearchParams(location.search);
      const refCode = searchParams.get('ref');

      // 3. Llamamos a la acción del store para que se encargue de la comunicación con el backend
      console.log(`[HomePage] Iniciando sincronización para ${telegramUser.id} con refCode: ${refCode}`);
      await syncUserWithBackend(telegramUser, refCode);
    };

    initialize();
  }, [syncUserWithBackend, location.search]); // Dependencias para asegurar que se ejecuta correctamente
  // === FIN DE LA LÓGICA DE SINCRONIZACIÓN INICIAL ===


  // El resto de la lógica de la página se mantiene igual.
  // Solo se ejecutará y renderizará correctamente una vez que 'user'
  // esté poblado en el store tras una sincronización exitosa.
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

  // El return de JSX se mantiene exactamente igual.
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