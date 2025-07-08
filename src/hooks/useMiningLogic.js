// frontend/src/hooks/useMiningLogic.js (VERSIÓN FINAL REFACTORIZADA CON MININGSTATUS)
import { useState, useEffect } from 'react';

const CLAIM_CYCLE_SECONDS = 24 * 60 * 60; // 24 horas en segundos

// --- CAMBIO: El hook ahora acepta 'miningStatus' ---
export const useMiningLogic = (lastClaim, miningRate, miningStatus) => {
  const [accumulatedNtx, setAccumulatedNtx] = useState(0);
  const [countdown, setCountdown] = useState('00:00:00');
  const [progress, setProgress] = useState(0);
  // --- CAMBIO: 'isClaimable' se reemplaza por 'buttonState' ---
  const [buttonState, setButtonState] = useState('HIDDEN'); 

  useEffect(() => {
    let interval; // Definimos el intervalo fuera del switch para poder limpiarlo

    // --- NUEVO: Edge case para usuarios sin herramientas activas ---
    if (miningRate === 0) {
      setAccumulatedNtx(0);
      setCountdown('24:00:00');
      setProgress(0);
      setButtonState('HIDDEN'); // No mostrar ningún botón si no hay minado
      return; // Salimos temprano
    }

    // --- NUEVO: Lógica centralizada basada en el estado del backend ---
    switch (miningStatus) {
      case 'IDLE':
        // El ciclo está esperando a ser iniciado.
        setAccumulatedNtx(0);
        setProgress(0);
        setCountdown('24:00:00');
        setButtonState('SHOW_START');
        break;

      case 'CLAIMABLE':
        // El ciclo ya se completó y fue marcado como reclamable por el backend.
        const fullCycleAmountClaimable = (miningRate / 3600) * CLAIM_CYCLE_SECONDS;
        setAccumulatedNtx(fullCycleAmountClaimable);
        setProgress(100);
        setCountdown('00:00:00');
        setButtonState('SHOW_CLAIM');
        break;

      case 'MINING':
        // El ciclo está activo, aquí es donde corre el temporizador.
        const lastClaimTime = lastClaim ? new Date(lastClaim).getTime() : Date.now();
        
        interval = setInterval(() => {
          const now = Date.now();
          const secondsPassed = Math.floor((now - lastClaimTime) / 1000);
          
          if (secondsPassed >= CLAIM_CYCLE_SECONDS) {
            // El tiempo se ha cumplido, mostramos el estado de 'Reclamar'.
            const fullCycleAmount = (miningRate / 3600) * CLAIM_CYCLE_SECONDS;
            setAccumulatedNtx(fullCycleAmount);
            setCountdown('00:00:00');
            setProgress(100);
            setButtonState('SHOW_CLAIM');
            clearInterval(interval);
            return;
          }
          
          // Mientras el tiempo no se cumple, actualizamos los valores.
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
          setButtonState('HIDDEN'); // Mientras mina, el botón está oculto.

        }, 1000);
        break;

      default:
        // Estado por defecto o desconocido, lo tratamos como inactivo.
        setButtonState('HIDDEN');
        break;
    }

    // Función de limpieza: se asegura de que el intervalo se detenga
    // si el componente se desmonta o los valores cambian.
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [lastClaim, miningRate, miningStatus]); // El hook se re-ejecuta si CUALQUIERA de estos cambia.

  // --- CAMBIO: Devolvemos 'buttonState' en lugar de 'isClaimable' ---
  return { accumulatedNtx, countdown, progress, buttonState };
};