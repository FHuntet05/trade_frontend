// RUTA: frontend/src/pages/HomePage.jsx (VERSIÓN "NEXUS - GLOBAL STYLE SYNC")
import React from 'react';
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
  const { user, updateUser } = useUserStore();
  
  const lastClaim = user?.lastMiningClaim;
  const miningRate = user?.effectiveMiningRate ?? 0;
  const miningStatus = user?.miningStatus ?? 'IDLE';

  const { accumulatedNtx, countdown, progress, isClaimable } = useMiningLogic(lastClaim, miningRate, miningStatus);

  const handleClaim = async () => {
    if (!isClaimable) {
      toast.error('Aún no puedes reclamar.');
      return;
    }
    const claimPromise = api.post('/wallet/claim');
    toast.promise(claimPromise, {
      loading: 'Reclamando ganancias...',
      success: (response) => {
        updateUser(response.data.user);
        return response.data.message;
      },
      error: (error) => error.response?.data?.message || 'Error al reclamar.',
    });
  };
  
  const handleStartMining = async () => {
    if (miningStatus !== 'IDLE') return;

    const startPromise = api.post('/wallet/start-mining');
    toast.promise(startPromise, {
        loading: 'Iniciando ciclo de minado...',
        success: (response) => {
            updateUser(response.data.user);
            return response.data.message;
        },
        error: (error) => error.response?.data?.message || 'No se pudo iniciar el minado.'
    });
  };

  let buttonText = 'Cargando...';
  let buttonAction = () => {};
  let isButtonDisabled = true;

  if (miningStatus === 'IDLE') {
    buttonText = 'EMPEZAR A MINAR';
    buttonAction = handleStartMining;
    isButtonDisabled = false;
  } else if (miningStatus === 'MINING') {
    if (isClaimable) {
      buttonText = 'RECLAMAR GANANCIAS';
      buttonAction = handleClaim;
      isButtonDisabled = false;
    } else {
      buttonText = 'MINANDO...';
      isButtonDisabled = true;
    }
  }

  return (
    <div className="animate-fade-in space-y-4 pt-6 px-4 pb-4">
      <UserInfoHeader />
      <RealTimeClock />

      <div className="flex flex-col items-center justify-center text-center">
        <video
          src="/assets/mining-animation.webm"
          autoPlay
          loop
          muted
          playsInline
          className="w-52 h-52 mx-auto"
        >
          Tu navegador no soporta el video.
        </video>
        
        <AnimatedCounter value={parseFloat(accumulatedNtx.toFixed(2))} />
        
        <div className="w-full max-w-xs mx-auto mt-4 space-y-2">
          <div className="w-full bg-dark-secondary rounded-full h-3">
            {/* [NEXUS STYLE SYNC] - Se reemplaza el gradiente por el color de acento sólido */}
            <div 
              className="bg-accent h-3 rounded-full transition-all duration-1000" 
              style={{width: `${progress}%`}}
            ></div>
          </div>
          <p className="text-text-secondary text-base font-mono">
            {countdown}
          </p>
        </div>
      </div>
      
      <div className="w-full">
        {/* [NEXUS STYLE SYNC] - Se reemplaza el gradiente por el color de acento sólido */}
        <button 
          onClick={buttonAction}
          disabled={isButtonDisabled}
          className="w-full py-4 bg-accent text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {buttonText}
        </button>
      </div>
      
      <TaskCenter />
      <NotificationFeed />
    </div>
  );
};

export default HomePage;