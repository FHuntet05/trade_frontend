import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useUserStore } from '@/store';
import { IOSButton, IOSCard } from '../components/ui/IOSComponents';
import { FiCopy, FiGift, FiPlusCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

// --- INICIO DE LA MODIFICACIÓN ---
// 1. Se importa la librería para el efecto de confeti.
// Asegúrate de haberla instalado: npm install canvas-confetti
import confetti from 'canvas-confetti';
// --- FIN DE LA MODIFICACIÓN ---

const WheelPage = () => {
  const { user } = useUserStore();
  const [spins, setSpins] = useState(10); // Valor de ejemplo
  const [isSpinning, setIsSpinning] = useState(false);
  
  const wheelControl = useAnimation();
  
  // --- INICIO DE LA MODIFICACIÓN ---
  // 2. Renderizado Visual de Premios: El array de premios ahora incluye una propiedad 'icon'
  // que es un componente de React (puede ser una <img> o un icono).
  // La lógica de obtención de giros por depósito está obsoleta.
  const rewards = [
    { type: 'usdt', value: 1, icon: <img src="/assets/images/USDT.png" alt="USDT" className="w-8 h-8" />, text: '1 USDT', probability: 0.05 },
    { type: 'spin', value: 1, icon: <FiGift className="w-8 h-8 text-yellow-500"/>, text: '+1 Giro', probability: 0.20 },
    { type: 'usdt', value: 0.1, icon: <img src="/assets/images/USDT.png" alt="USDT" className="w-6 h-6" />, text: '0.1 USDT', probability: 0.35 },
    { type: 'usdt', value: 5, icon: <img src="/assets/images/USDT.png" alt="USDT" className="w-8 h-8" />, text: '5 USDT', probability: 0.02 },
    { type: 'spin', value: 2, icon: <FiGift className="w-8 h-8 text-yellow-500"/>, text: '+2 Giros', probability: 0.10 },
    { type: 'usdt', value: 0.5, icon: <img src="/assets/images/USDT.png" alt="USDT" className="w-7 h-7" />, text: '0.5 USDT', probability: 0.28 },
  ];

  // 4. Notificación de Premio (Toast): Se reemplaza el toast por una animación de confeti.
  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      zIndex: 1000
    });
  };
  // --- FIN DE LA MODIFICACIÓN ---
  
  const spinWheel = async () => {
    if (isSpinning || spins <= 0) return;

    setIsSpinning(true);
    setSpins(prev => prev - 1);

    const random = Math.random();
    let accumulatedProbability = 0;
    let selectedReward;

    for (const reward of rewards) {
      accumulatedProbability += reward.probability;
      if (random <= accumulatedProbability) {
        selectedReward = reward;
        break;
      }
    }
    
    if (!selectedReward) selectedReward = rewards[rewards.length - 1];

    const rewardIndex = rewards.indexOf(selectedReward);
    const segmentAngle = 360 / rewards.length;
    const finalAngle = (5 * 360) + (360 - (rewardIndex * segmentAngle)) - (segmentAngle / 2);

    await wheelControl.start({
      rotate: finalAngle,
      transition: { duration: 5, ease: "easeOut" }
    });

    // 4. Notificación de Premio (Toast): Se llama a la función de confeti y a un toast mejorado.
    triggerConfetti();
    toast.success(`¡Ganaste ${selectedReward.text}!`, {
      icon: '🎉',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });

    // Aquí iría la lógica para acreditar el premio al usuario
    if (selectedReward.type === 'spin') {
      setSpins(prev => prev + selectedReward.value);
    }
    // ... acreditar USDT, etc.

    setIsSpinning(false);
  };

  // 5. Módulo de Misiones: Función para copiar el enlace de referido.
  const handleCopyReferralLink = () => {
    const referralLink = `https://t.me/your_bot?start=${user?.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast.success('Enlace de referido copiado');
  };

  return (
    <div className="min-h-screen bg-system-background ios-safe-top pb-20 px-4">
      <div className="flex flex-col items-center pt-6">
        <h1 className="text-2xl font-ios-display font-bold text-text-primary mb-2">
          Ruleta de Premios
        </h1>
        <p className="font-ios text-text-secondary mb-4">
          Invita amigos para ganar más giros.
        </p>

        {/* --- INICIO DE LA MODIFICACIÓN --- */}
        {/* 3. Contador de XP: Se hace visualmente prominente. */}
        <IOSCard className="w-full mb-6">
          <div className="flex justify-between items-center">
            <span className="font-ios text-text-secondary">Balance de XP</span>
            <span className="font-ios-display text-3xl font-bold text-ios-green">
              {user?.balance?.ntx.toFixed(2) || '0.00'}
            </span>
          </div>
        </IOSCard>
        {/* --- FIN DE LA MODIFICACIÓN --- */}
        
        {/* Ruleta y Giros */}
        <div className="flex flex-col items-center justify-center w-full mb-6">
          <div className="relative w-80 h-80 mb-4">
            {/* Flecha indicadora */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-10 h-10 z-10"
                 style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}>
              <div className="w-full h-full bg-ios-green shadow-lg" />
            </div>

            {/* 2. Renderizado Visual de Premios: La ruleta ahora renderiza segmentos con imágenes/iconos. */}
            <motion.div
              className="w-full h-full rounded-full border-4 border-white shadow-xl overflow-hidden"
              animate={wheelControl}
              initial={{ rotate: 0 }}
            >
              {rewards.map((reward, index) => (
                <div
                  key={index}
                  className="absolute w-1/2 h-1/2 top-1/2 left-1/2 origin-top-left flex items-center justify-start text-center"
                  style={{
                    transform: `rotate(${index * (360 / rewards.length)}deg)`,
                    clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 0)`, // Crea un triángulo
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F2F2F7',
                  }}
                >
                  <div 
                    className="flex flex-col items-center justify-center w-[120px] h-full"
                    style={{ transform: `rotate(${ (360 / rewards.length) / 2 }deg) translate(20px, 0)` }}>
                    {reward.icon}
                    <p className="font-ios font-semibold text-sm mt-1">{reward.text}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <p className="font-ios text-text-secondary">Giros restantes: <span className="font-bold text-ios-green text-lg">{spins}</span></p>
        </div>

        <IOSButton
          variant="primary"
          onClick={spinWheel}
          disabled={isSpinning || spins <= 0}
          className="w-full mb-8"
        >
          {isSpinning ? 'Girando...' : 'Girar Ruleta'}
        </IOSButton>

        {/* --- INICIO DE LA MODIFICACIÓN --- */}
        {/* 5. Módulo de Misiones de Invitación: Nueva sección. */}
        <IOSCard className="w-full">
          <h3 className="font-ios-display font-semibold text-lg mb-4 text-text-primary">
            Misiones de Giros
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-system-secondary p-3 rounded-ios">
              <div className="flex items-center gap-3">
                <FiPlusCircle className="w-5 h-5 text-ios-green" />
                <span className="font-ios text-sm text-text-secondary">Invita a 10 amigos</span>
              </div>
              <span className="font-semibold text-ios-green">+5 Giros</span>
            </div>
            <div className="flex justify-between items-center bg-system-secondary p-3 rounded-ios">
              <div className="flex items-center gap-3">
                <FiPlusCircle className="w-5 h-5 text-ios-green" />
                <span className="font-ios text-sm text-text-secondary">Invita a 50 amigos</span>
              </div>
              <span className="font-semibold text-ios-green">+30 Giros</span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyReferralLink}
            className="w-full mt-4 bg-ios-green/10 text-ios-green py-3 rounded-ios font-ios text-center flex items-center justify-center gap-2"
          >
            <FiCopy />
            Copiar mi enlace de referido
          </motion.button>
        </IOSCard>
        {/* --- FIN DE LA MODIFICACIÓN --- */}

      </div>
    </div>
  );
};

export default WheelPage;