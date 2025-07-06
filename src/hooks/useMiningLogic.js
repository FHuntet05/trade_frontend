// frontend/src/hooks/useMiningLogic.js
import { useState, useEffect } from 'react';

const CLAIM_CYCLE_SECONDS = 24 * 60 * 60; // 24 horas en segundos

export const useMiningLogic = (lastClaim, miningRate) => {
  const [accumulatedNtx, setAccumulatedNtx] = useState(0);
  const [countdown, setCountdown] = useState('');
  const [progress, setProgress] = useState(0);
  const [isClaimable, setIsClaimable] = useState(false);

  useEffect(() => {
    const lastClaimTime = lastClaim ? new Date(lastClaim).getTime() : Date.now();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const secondsPassed = Math.floor((now - lastClaimTime) / 1000);
      
      if (secondsPassed >= CLAIM_CYCLE_SECONDS) {
        const fullCycleAmount = (miningRate / 3600) * CLAIM_CYCLE_SECONDS;
        setAccumulatedNtx(fullCycleAmount);
        setCountdown('00:00:00');
        setProgress(100);
        setIsClaimable(true);
        clearInterval(interval); // Detenemos el intervalo cuando se completa
        return;
      }
      
      const currentAccumulation = (miningRate / 3600) * secondsPassed;
      setAccumulatedNtx(currentAccumulation);

      const secondsRemaining = CLAIM_CYCLE_SECONDS - secondsPassed;
      const hours = Math.floor(secondsRemaining / 3600);
      const minutes = Math.floor((secondsRemaining % 3600) / 60);
      const seconds = secondsRemaining % 60;
      setCountdown(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
      
      const currentProgress = (secondsPassed / CLAIM_CYCLE_SECONDS) * 100;
      setProgress(currentProgress);
      setIsClaimable(false);

    }, 1000);

    return () => clearInterval(interval);
  }, [lastClaim, miningRate]);

  return { accumulatedNtx, countdown, progress, isClaimable };
};