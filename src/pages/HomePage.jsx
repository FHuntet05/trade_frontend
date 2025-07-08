// src/pages/HomePage.jsx (VERSIÓN CORREGIDA CON LAYOUT DINÁMICO)
import React from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';

import UserInfoHeader from '../components/home/UserInfoHeader';
import RealTimeClock from '../components/home/RealTimeClock';
import AnimatedCounter from '../components/home/AnimatedCounter';
import TaskCenter from '../components/home/TaskCenter';
import { useMiningLogic } from '../hooks/useMiningLogic';

const HomePage = () => {
  const { user, updateUser } = useUserStore();

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
        return (
          <button 
            onClick={handleStartMining}
            className="w-full py-4 bg-blue-500 text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all"
          >
            INICIAR
          </button>
        );
      case 'SHOW_CLAIM':
        return (
          <button 
            onClick={handleClaim}
            className="w-full py-4 bg-gradient-to-r from-accent-start to-accent-end text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all"
          >
            RECLAMAR GANANCIAS
          </button>
        );
      case 'HIDDEN':
      default:
        return null; 
    }
  };

  // <<< INICIO DE LA CORRECCIÓN (Punto #5): Condicional para `flex-grow` >>>
  const shouldShowButton = buttonState === 'SHOW_START' || buttonState === 'SHOW_CLAIM';

  return (
    // Se ha añadido `overflow-y-auto` para permitir el scroll si el contenido crece
    <div className="flex flex-col h-full animate-fade-in gap-4 overflow-y-auto pb-4">
      <div className="px-4 pt-4"> {/* Añadimos padding a los elementos superiores */}
        <UserInfoHeader />
        <RealTimeClock />
      </div>

      <div className="flex flex-col items-center justify-center text-center px-4">
        <video src="/assets/mining-animation.webm" autoPlay loop muted playsInline className="w-48 h-48 sm:w-52 sm:h-52 mx-auto" />
        <AnimatedCounter value={parseFloat(accumulatedNtx.toFixed(2))} />
        
        <div className="w-full max-w-xs mx-auto mt-4 space-y-2">
          <div className="w-full bg-dark-secondary rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-accent-start to-accent-end h-3 rounded-full transition-all duration-1000" 
              style={{width: `${progress}%`}}
            />
          </div>
          <p className="text-text-secondary text-base font-mono">
            {countdown}
          </p>
        </div>
      </div>
      
      {/* Contenedor principal para los elementos inferiores */}
      <div className="flex flex-col flex-grow px-4 space-y-4">
        {/* El contenedor del botón siempre existe, pero el botón solo se renderiza si es necesario */}
        <div className="w-full h-16 flex items-center justify-center">
          {renderControlButton()}
        </div>
      
        {/* TaskCenter ahora tiene `flex-grow` si el botón está oculto */}
        <div className={!shouldShowButton ? 'flex-grow' : ''}>
          <TaskCenter />
        </div>
      </div>
    </div>
  );
};

export default HomePage;