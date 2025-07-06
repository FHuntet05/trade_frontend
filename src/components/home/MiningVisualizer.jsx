// frontend/src/components/home/MiningVisualizer.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast'; // Importar toast
import { useTranslation } from 'react-i18next'; // Importar hook de traducción
import useUserStore from '../../store/userStore';
import api from '../../api/axiosConfig';
import miningIllustration from '../../assets/mining-illustration.png';
import { SparklesIcon } from '@heroicons/react/24/outline';

const MiningVisualizer = () => {
  const { user, updateUser } = useUserStore();
  const { t } = useTranslation(); // Inicializar hook
  const [minedAmount, setMinedAmount] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(24 * 60 * 60);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (!user) return;

    const lastClaim = new Date(user.lastMiningClaim).getTime();
    const now = Date.now();
    const secondsPassed = Math.max(0, (now - lastClaim) / 1000);
    const initialMined = (user.effectiveMiningRate / 3600) * secondsPassed;
    
    const elapsedSessionTime = secondsPassed % (24 * 60 * 60);
    setSessionDuration(24 * 60 * 60 - elapsedSessionTime);

    setMinedAmount(initialMined);

    const interval = setInterval(() => {
      setMinedAmount(prev => prev + user.effectiveMiningRate / 3600);
      setSessionDuration(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [user.lastMiningClaim, user.effectiveMiningRate]);

  const handleClaim = async () => {
    if (isClaiming || minedAmount < 0.0001) return;

    setIsClaiming(true);

    const claimPromise = api.post('/wallet/claim');

    toast.promise(
      claimPromise,
      {
        loading: t('home.claimToast.loading'),
        success: (response) => {
          updateUser(response.data.user);
          setMinedAmount(0); // Reiniciar visualmente
          return t('home.claimToast.success');
        },
        error: (error) => {
          // El backend puede enviar un mensaje específico, si no, usamos el genérico
          return error.response?.data?.message || t('home.claimToast.error');
        }
      }
    ).finally(() => {
      setIsClaiming(false);
    });
  };

  if (!user) return null;

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  
  const canClaim = minedAmount > 0.0001;

  // Determinar el texto del botón usando las traducciones
  let buttonText;
  if (isClaiming) {
    buttonText = t('home.claimButton.claiming');
  } else if (canClaim) {
    buttonText = t('home.claimButton.claim');
  } else {
    buttonText = t('home.claimButton.mining');
  }

  return (
    <div className="flex flex-col items-center text-white space-y-4">
       <div className="self-end -mb-2">
        <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg px-3 py-1 text-sm font-semibold text-blue-300">
          {user.effectiveMiningRate.toFixed(2)} {t('home.miningRate')}
        </div>
      </div>
      <img src={miningIllustration} alt="Mining Illustration" className="w-48 h-48 object-contain" />
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tighter text-white">
          {minedAmount.toFixed(4)}
        </h1>
        <span className="text-lg font-light text-gray-400">{t('home.mined')}</span>
      </div>
      <div className="w-full max-w-sm space-y-2">
        <div className="w-full bg-gray-700/50 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-pink-500 to-purple-600 h-2.5 rounded-full" 
            style={{ width: `${100 - (sessionDuration / (24 * 60 * 60)) * 100}%` }} // Corregido: La barra debe llenarse, no vaciarse
          ></div>
        </div>
        <div className="text-center text-sm font-mono text-gray-400">
          {formatTime(sessionDuration)}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClaim}
        disabled={isClaiming || !canClaim}
        className="w-full max-w-sm py-3 font-bold text-white rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SparklesIcon className="w-6 h-6" />
        {buttonText}
      </motion.button>
    </div>
  );
};

export default MiningVisualizer;