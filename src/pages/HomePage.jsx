// src/pages/HomePage.jsx (VERSIÓN FINAL CON TODAS LAS MEJORAS)
import React from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';

// Importación de nuevos componentes y hook
import UserInfoHeader from '../components/home/UserInfoHeader';
import RealTimeClock from '../components/home/RealTimeClock';
import AnimatedCounter from '../components/home/AnimatedCounter';
import TaskCenter from '../components/home/TaskCenter';
import NotificationFeed from '../components/home/NotificationFeed';
import { useMiningLogic } from '../hooks/useMiningLogic';

const HomePage = () => {
  const { user, updateUser } = useUserStore();

  // Extraemos los valores del usuario de forma segura
  const lastClaim = user?.lastMiningClaim;
  const miningRate = user?.effectiveMiningRate ?? 0;
  
  // Usamos nuestro custom hook para toda la lógica compleja
  const { accumulatedNtx, countdown, progress, isClaimable } = useMiningLogic(lastClaim, miningRate);

  const handleClaim = async () => {
    if (!isClaimable) {
      toast.error('Aún no puedes reclamar.');
      return;
    }
    toast.loading('Reclamando...', { id: 'claim' });
    try {
      const response = await api.post('/wallet/claim');
      updateUser(response.data.user);
      toast.success(response.data.message, { id: 'claim' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al reclamar.';
      toast.error(errorMessage, { id: 'claim' });
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in gap-4">
      <UserInfoHeader />
      <RealTimeClock />

      <div className="flex-grow flex flex-col items-center justify-center text-center">
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
            <div 
              className="bg-gradient-to-r from-accent-start to-accent-end h-3 rounded-full transition-all duration-1000" 
              style={{width: `${progress}%`}}
            ></div>
          </div>
          <p className="text-text-secondary text-base font-mono">
            {countdown}
          </p>
        </div>
      </div>
      
      <div className="w-full px-4 mb-2">
        <button 
          onClick={handleClaim}
          disabled={!isClaimable}
          className="w-full py-4 bg-gradient-to-r from-accent-start to-accent-end text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          RECLAMAR GANANCIAS
        </button>
      </div>
      
      <TaskCenter />
      <NotificationFeed />
    </div>
  );
};

export default HomePage;