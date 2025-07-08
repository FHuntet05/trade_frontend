// src/pages/HomePage.jsx (VERSIÓN MODIFICADA PARA EL NUEVO CICLO DE BOTONES)
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
  // --- CAMBIO: Pasamos el nuevo estado al hook ---
  const miningStatus = user?.miningStatus ?? 'IDLE'; 
  
  // --- CAMBIO: El hook ahora devolverá el estado del botón ---
  const { accumulatedNtx, countdown, progress, buttonState } = useMiningLogic(
    lastClaim,
    miningRate,
    miningStatus
  );

  // --- NUEVA FUNCIÓN: Para manejar el clic en "Iniciar" ---
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
    // La lógica de 'isClaimable' ahora estará dentro de buttonState === 'SHOW_CLAIM'
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

  // --- NUEVA FUNCIÓN: Para renderizar el botón correcto ---
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
        // No renderiza ningún botón si está minando o no hay herramientas.
        return null; 
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in gap-4">
      <UserInfoHeader />
      <RealTimeClock />

      <div className="flex-grow flex flex-col items-center justify-center text-center">
        {/* ... (Video y contador sin cambios) ... */}
        <video src="/assets/mining-animation.webm" autoPlay loop muted playsInline className="w-52 h-52 mx-auto" />
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
      
      {/* --- CAMBIO: Área de botón ahora usa el renderizador condicional --- */}
      <div className="w-full px-4 mb-2 h-16 flex items-center justify-center">
        {renderControlButton()}
      </div>
      
      <TaskCenter />
      <NotificationFeed />
    </div>
  );
};

export default HomePage;