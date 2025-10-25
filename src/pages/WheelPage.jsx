// RUTA: frontend/src/pages/WheelPage.jsx
// --- VERSIÓN FINAL CON CORRECCIÓN VISUAL CRÍTICA EN LA RULETA ---

import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import useUserStore from '@/store/userStore';
import { IOSButton, IOSCard } from '../components/ui/IOSComponents';
import { FiCopy, FiGift } from 'react-icons/fi';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import api from '@/api/axiosConfig';

// Configuración visual. El backend sigue siendo la fuente de la verdad para los premios.
const rewards = [
    { text: '1 USDT', icon: <img src="/assets/images/USDT.png" alt="USDT" className="w-8 h-8" /> },
    { text: '+1 Giro', icon: <FiGift className="w-8 h-8 text-yellow-500"/> },
    { text: '0.1 USDT', icon: <img src="/assets/images/USDT.png" alt="USDT" className="w-6 h-6" /> },
    { text: '5 USDT', icon: <img src="/assets/images/USDT.png" alt="USDT" className="w-8 h-8" /> },
    { text: '+2 Giros', icon: <FiGift className="w-8 h-8 text-yellow-500"/> },
    { text: '0.5 USDT', icon: <img src="/assets/images/USDT.png" alt="USDT" className="w-7 h-7" /> },
    { text: 'NADA', icon: <span className="text-2xl">😢</span> },
    { text: '10 USDT', icon: <img src="/assets/images/USDT.png" alt="USDT" className="w-8 h-8" /> },
];
const SEGMENT_COUNT = rewards.length;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT; // 45 grados

const WheelPage = () => {
  const { user, updateUserBalances } = useUserStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelControl = useAnimation();
  const availableSpins = user?.balance?.spins || 0;

  const triggerConfetti = () => {
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, zIndex: 1000 });
  };
  
  const spinWheel = async () => {
    if (isSpinning || availableSpins <= 0) return;
    setIsSpinning(true);
    try {
      const response = await api.post('/api/wheel/spin');
      const { resultIndex, newBalances, prize } = response.data;
      const finalAngle = (5 * 360) + (360 - (resultIndex * SEGMENT_ANGLE) - (SEGMENT_ANGLE / 2));

      await wheelControl.start({
        rotate: finalAngle,
        transition: { duration: 6, ease: "easeOut" }
      });

      triggerConfetti();
      toast.success(`¡Ganaste ${prize.text}!`, { icon: '🎉' });
      updateUserBalances(newBalances);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Ocurrió un error al girar.";
      toast.error(errorMessage);
    } finally {
      setIsSpinning(false);
    }
  };

  const handleCopyReferralLink = () => {
    if (!user?.referralCode) {
      toast.error("No se pudo encontrar tu código de referido.");
      return;
    }
    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'YOUR_BOT_USERNAME_HERE';
    const referralLink = `https://t.me/${botUsername}?start=${user.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast.success('Enlace de referido copiado');
  };

  return (
    <div className="min-h-screen bg-system-background ios-safe-top pb-20 px-4">
      <div className="flex flex-col items-center pt-6">
        <h1 className="text-2xl font-ios-display font-bold text-text-primary mb-2">Ruleta de Premios</h1>
        <p className="font-ios text-text-secondary mb-4">Invita amigos para ganar más giros.</p>

        <IOSCard className="w-full mb-6">
          <div className="flex justify-between items-center">
            <span className="font-ios text-text-secondary">Giros disponibles</span>
            <span className="font-ios-display text-3xl font-bold text-ios-green">{availableSpins}</span>
          </div>
        </IOSCard>
        
        <div className="flex flex-col items-center justify-center w-full mb-6">
          <div className="relative w-80 h-80">
            {/* Indicador de premio (flecha) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-10 h-10 z-10"
                 style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}>
              <div className="w-full h-full bg-ios-green shadow-lg" />
            </div>

            {/* --- INICIO DE LA ESTRUCTURA VISUAL CORREGIDA --- */}
            <motion.ul
              className="w-full h-full rounded-full relative overflow-hidden border-4 border-white shadow-xl"
              animate={wheelControl}
              initial={{ rotate: 0 }}
            >
              {rewards.map((reward, index) => (
                <li
                  key={index}
                  className="absolute top-0 left-0 w-1/2 h-1/2 origin-bottom-right"
                  style={{
                    transform: `rotate(${index * SEGMENT_ANGLE}deg) skewY(-${90 - SEGMENT_ANGLE}deg)`,
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F2F2F7',
                  }}
                >
                  {/* Contenedor de Corrección: Este div anula la transformación del padre. */}
                  <div
                    className="absolute w-full h-full flex items-center justify-center"
                    style={{
                      transform: `skewY(${90 - SEGMENT_ANGLE}deg) rotate(${SEGMENT_ANGLE / 2}deg)`,
                    }}
                  >
                    {/* Contenedor de Contenido: Usa Flexbox para centrar y orientar el premio. */}
                    <div className='transform -rotate-90 flex flex-col items-center justify-start pt-4 text-center'>
                      <p className="font-ios font-semibold text-xs break-words">{reward.text}</p>
                      <div className="mt-2">
                        {reward.icon}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </motion.ul>
            {/* --- FIN DE LA ESTRUCTURA VISUAL CORREGIDA --- */}
          </div>
        </div>

        <IOSButton
          variant="primary"
          onClick={spinWheel}
          disabled={isSpinning || availableSpins <= 0}
          className="w-full mb-8"
        >
          {isSpinning ? 'Girando...' : (availableSpins > 0 ? 'Girar Ruleta' : 'Sin Giros')}
        </IOSButton>

        <IOSCard className="w-full">
            <h3 className="font-ios-display font-semibold text-lg mb-4 text-text-primary">Gana más giros</h3>
            <p className="font-ios text-sm text-text-secondary mb-4">
                Obtienes un giro por cada amigo que se una con tu enlace. ¡Comparte para ganar!
            </p>
            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCopyReferralLink}
                className="w-full bg-ios-green/10 text-ios-green py-3 rounded-ios font-ios text-center flex items-center justify-center gap-2"
            >
                <FiCopy />
                Copiar mi enlace de referido
            </motion.button>
        </IOSCard>
      </div>
    </div>
  );
};

export default WheelPage;