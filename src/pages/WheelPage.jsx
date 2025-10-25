// RUTA: frontend/src/pages/WheelPage.jsx
// --- VERSIÓN FINAL AJUSTADA AL ESTÁNDAR VISUAL PROFESIONAL ---

import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import useUserStore from '@/store/userStore';
import { IOSButton, IOSCard } from '../components/ui/IOSComponents';
import { FiCopy, FiGift } from 'react-icons/fi';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import api from '@/api/axiosConfig';

// Configuración visual. Los tamaños de los iconos se han mantenido, son adecuados.
const rewards = [
    { text: '$1.00', icon: <img src="/assets/images/USDT.png" alt="USDT" className="w-8 h-8" /> },
    { text: '+1 Giro', icon: <FiGift className="w-8 h-8 text-yellow-500"/> },
    { text: '$0.10', icon: <img src="/assets/images/USDT.png" alt="USDT" className="w-7 h-7" /> },
    { text: '$5.00', icon: <img src="/assets/images/USDT.png" alt="USDT" className="w-8 h-8" /> },
    { text: '+2 Giros', icon: <FiGift className="w-8 h-8 text-yellow-500"/> },
    { text: '$0.50', icon: <img src="/assets/images/USDT.png" alt="USDT" className="w-7 h-7" /> },
    { text: 'NADA', icon: <span className="text-2xl">😢</span> },
    { text: '$10.00', icon: <img src="/assets/images/USDT.png" alt="USDT" className="w-8 h-8" /> },
];
const SEGMENT_COUNT = rewards.length;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

const WheelPage = () => {
  const { user, updateUserBalances } = useUserStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelControl = useAnimation();
  const availableSpins = user?.balance?.spins || 0;

  // La lógica de giro y de la página no necesita cambios.
  const triggerConfetti = () => confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, zIndex: 1000 });
  
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
      toast.error(error.response?.data?.message || "Ocurrió un error al girar.");
    } finally {
      setIsSpinning(false);
    }
  };

  const handleCopyReferralLink = () => {
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
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-10 h-10 z-10" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}>
              <div className="w-full h-full bg-ios-green shadow-lg" />
            </div>

            {/* --- INICIO DE LA ESTRUCTURA VISUAL REFINADA --- */}
            <motion.ul
              className="w-full h-full rounded-full relative overflow-hidden border-4 border-white shadow-xl"
              animate={wheelControl}
              initial={{ rotate: 0 }}
            >
              {rewards.map((reward, index) => (
                <li
                  key={index}
                  className="absolute top-0 left-0 w-1/2 h-12 origin-bottom-right"
                  style={{
                    transform: `rotate(${index * SEGMENT_ANGLE}deg) skewY(-${90 - SEGMENT_ANGLE}deg)`,
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F2F2F7', // Sin colores vibrantes
                  }}
                >
                  <div
                    className="absolute w-full h-full flex items-center justify-center"
                    style={{
                      transform: `skewY(${90 - SEGMENT_ANGLE}deg) rotate(${SEGMENT_ANGLE / 2}deg)`,
                    }}
                  >
                    {/* 
                      **CONTENEDOR DE CONTENIDO CORREGIDO:**
                      1. `flex-col` asegura el orden vertical: ícono arriba, texto abajo.
                      2. `items-center` centra horizontalmente.
                      3. `-rotate-90` orienta el bloque entero hacia afuera.
                    */}
                    <div className='transform -rotate-90 flex flex-col items-center'>
                      {reward.icon}
                      {/* `mt-2` añade el espacio vertical entre el ícono y el texto. */}
                      <p className="font-ios font-bold text-sm mt-2">{reward.text}</p>
                    </div>
                  </div>
                </li>
              ))}
            </motion.ul>
            {/* --- FIN DE LA ESTRUCTURA VISUAL REFINADA --- */}
          </div>
        </div>

        <IOSButton variant="primary" onClick={spinWheel} disabled={isSpinning || availableSpins <= 0} className="w-full mb-8">
          {isSpinning ? 'Girando...' : (availableSpins > 0 ? 'Girar Ruleta' : 'Sin Giros')}
        </IOSButton>

        <IOSCard className="w-full">
            <h3 className="font-ios-display font-semibold text-lg mb-4 text-text-primary">Gana más giros</h3>
            <p className="font-ios text-sm text-text-secondary mb-4">
                Obtienes un giro por cada amigo que se una con tu enlace. ¡Comparte para ganar!
            </p>
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleCopyReferralLink} className="w-full bg-ios-green/10 text-ios-green py-3 rounded-ios font-ios text-center flex items-center justify-center gap-2">
                <FiCopy /> Copiar mi enlace de referido
            </motion.button>
        </IOSCard>
      </div>
    </div>
  );
};

export default WheelPage;