// frontend/src/hooks/useMiningLogic.js (CON LÓGICA DE CÁLCULO DIARIO CORREGIDA)
import { useState, useEffect, useMemo } from 'react';

const CLAIM_CYCLE_SECONDS = 24 * 60 * 60; // 24 horas en segundos

export const useMiningLogic = (lastClaim, miningRate, miningStatus) => {
  const [accumulatedNtx, setAccumulatedNtx] = useState(0);
  const [countdown, setCountdown] = useState('00:00:00');
  const [progress, setProgress] = useState(0);
  const [buttonState, setButtonState] = useState('HIDDEN');

  // Usamos useMemo para evitar recalcular la fecha de inicio en cada render
  const startTime = useMemo(() => lastClaim ? new Date(lastClaim).getTime() : Date.now(), [lastClaim]);

  useEffect(() => {
    let interval;

    if (miningRate <= 0) {
      setButtonState('HIDDEN');
      return;
    }

    switch (miningStatus) {
      case 'IDLE':
        setAccumulatedNtx(0);
        setProgress(0);
        setCountdown('24:00:00');
        setButtonState('SHOW_START');
        break;

      case 'MINING':
        interval = setInterval(() => {
          const now = Date.now();
          const secondsPassed = Math.max(0, Math.floor((now - startTime) / 1000));

          if (secondsPassed >= CLAIM_CYCLE_SECONDS) {
            setAccumulatedNtx(miningRate); // Al final, muestra la tasa diaria completa
            setCountdown('00:00:00');
            setProgress(100);
            setButtonState('SHOW_CLAIM');
            clearInterval(interval);
            return;
          }

          // --- CORRECCIÓN CRÍTICA DE LA FÓRMULA ---
          // La ganancia acumulada es (TasaDiaria / SegundosEnUnDia) * SegundosTranscurridos
          const currentAccumulation = (miningRate / CLAIM_CYCLE_SECONDS) * secondsPassed;
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
          setButtonState('HIDDEN');

        }, 1000);
        break;
      
      // El estado CLAIMABLE es manejado por la lógica de MINING cuando el tiempo se cumple.
      // Si el backend lo setea directamente, la UI debe reaccionar.
      case 'CLAIMABLE':
        setAccumulatedNtx(miningRate);
        setProgress(100);
        setCountdown('00:00:00');
        setButtonState('SHOW_CLAIM');
        break;

      default:
        setButtonState('HIDDEN');
        break;
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [startTime, miningRate, miningStatus]);

  return { accumulatedNtx, countdown, progress, buttonState };
};