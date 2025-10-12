import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { IOSButton, IOSCard } from '../components/ui/IOSComponents';

const WheelPage = () => {
  const [spins, setSpins] = useState(10);
  const [xp, setXp] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastReward, setLastReward] = useState(null);
  
  const wheelControl = useAnimation();
  
  // Premios posibles en la ruleta
  const rewards = [
    { type: 'xp', value: 100, probability: 0.4 },
    { type: 'xp', value: 200, probability: 0.3 },
    { type: 'usdt', value: 0.0001, probability: 0.15 },
    { type: 'usdt', value: 0.001, probability: 0.1 },
    { type: 'spins', value: 1, probability: 0.04 },
    { type: 'usdt', value: 1, probability: 0.01 }
  ];

  // Convertir XP a USDT
  const xpToUsdt = (xpAmount) => {
    return (xpAmount * 0.0001).toFixed(4);
  };

  const spinWheel = async () => {
    if (isSpinning || spins <= 0) return;

    setIsSpinning(true);
    setSpins(prev => prev - 1);

    // Seleccionar premio basado en probabilidad
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

    // Calcular ángulo final basado en el premio
    const baseRotations = 5; // Número de vueltas completas
    const rewardIndex = rewards.indexOf(selectedReward);
    const segmentAngle = 360 / rewards.length;
    const finalAngle = baseRotations * 360 + (rewardIndex * segmentAngle);

    // Animar la ruleta
    await wheelControl.start({
      rotate: finalAngle,
      transition: {
        duration: 4,
        ease: [0.64, 0, 0.78, 0],
      }
    });

    // Actualizar estado con el premio
    if (selectedReward.type === 'xp') {
      setXp(prev => prev + selectedReward.value);
    } else if (selectedReward.type === 'spins') {
      setSpins(prev => prev + selectedReward.value);
    }

    setLastReward(selectedReward);
    setIsSpinning(false);
  };

  return (
    <div className="min-h-screen bg-system-background ios-safe-top pb-20 px-4">
      <div className="flex flex-col items-center pt-6">
        <h1 className="text-2xl font-ios-display font-bold text-text-primary mb-6">
          Ruleta de Premios
        </h1>

        {/* Contador de Giros */}
        <IOSCard className="w-full mb-6">
          <div className="flex justify-between items-center">
            <span className="font-ios text-text-secondary">Giros Disponibles</span>
            <span className="font-ios-display text-xl font-bold text-ios-green">
              {spins}
            </span>
          </div>
        </IOSCard>

        {/* Ruleta */}
        <div className="relative w-72 h-72 mb-8">
          <motion.div
            className="w-full h-full rounded-full bg-gradient-to-r from-ios-green-light to-ios-green-dark"
            style={{
              backgroundImage: `conic-gradient(
                from 0deg,
                #34C759 0deg 60deg,
                #30D158 60deg 120deg,
                #32D74B 120deg 180deg,
                #34C759 180deg 240deg,
                #30D158 240deg 300deg,
                #32D74B 300deg 360deg
              )`
            }}
            animate={wheelControl}
          >
            {/* Marcadores de segmentos */}
            {rewards.map((_, index) => (
              <div
                key={index}
                className="absolute top-1/2 left-1/2 w-full h-0.5 bg-white/20"
                style={{
                  transform: `rotate(${(index * 360) / rewards.length}deg)`
                }}
              />
            ))}
          </motion.div>
          
          {/* Flecha indicadora */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8">
            <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-[16px] border-t-ios-green" />
          </div>
        </div>

        {/* Botón de Giro */}
        <IOSButton
          variant="primary"
          onClick={spinWheel}
          disabled={isSpinning || spins <= 0}
          className="w-full mb-8"
        >
          {isSpinning ? 'Girando...' : 'Girar Ruleta'}
        </IOSButton>

        {/* Sistema XP */}
        <IOSCard className="w-full">
          <h3 className="font-ios-display font-semibold text-lg mb-4">
            Tus XP
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">XP Acumulados</span>
              <span className="font-semibold">{xp} XP</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Equivalente en USDT</span>
              <span className="font-semibold text-ios-green">
                ${xpToUsdt(xp)} USDT
              </span>
            </div>

            <IOSButton
              variant="secondary"
              onClick={() => {/* Lógica de reclamar USDT */}}
              disabled={xp < 1000} // Ejemplo: mínimo 1000 XP para reclamar
              className="w-full"
            >
              Reclamar USDT
            </IOSButton>
          </div>
        </IOSCard>

        {/* Último Premio */}
        {lastReward && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-20 left-4 right-4 bg-ios-green text-white p-4 rounded-ios text-center font-ios"
          >
            ¡Ganaste {lastReward.value} {lastReward.type.toUpperCase()}!
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WheelPage;