// frontend/src/hooks/useMiningLogic.js (VERSIÓN "NEXUS - STATE MACHINE REFACTORED")
import { useState, useEffect, useMemo } from 'react';

const CLAIM_CYCLE_SECONDS = 24 * 60 * 60; // 24 horas en segundos

export const useMiningLogic = (lastClaim, miningRate, miningStatus) => {
  // --- ESTADOS INTERNOS DEL HOOK ---
  const [accumulatedNtx, setAccumulatedNtx] = useState(0);
  const [countdown, setCountdown] = useState('24:00:00');
  const [progress, setProgress] = useState(0);
  const [isClaimable, setIsClaimable] = useState(false);

  // useMemo optimiza el cálculo de la fecha de inicio, evitando que se recalcule en cada render.
  const startTime = useMemo(() => lastClaim ? new Date(lastClaim).getTime() : Date.now(), [lastClaim]);

  useEffect(() => {
    // Si el usuario no tiene poder de minado, no hacemos nada.
    if (miningRate <= 0) {
      setCountdown('00:00:00');
      setProgress(0);
      setIsClaimable(false);
      return;
    }
    
    // Si el estado es 'IDLE', significa que el usuario debe iniciar el minado.
    // La UI mostrará el botón "Empezar a Minar".
    if (miningStatus === 'IDLE') {
      setAccumulatedNtx(0);
      setCountdown('24:00:00');
      setProgress(0);
      setIsClaimable(false);
      return; // No iniciamos ningún intervalo.
    }

    // Si el estado es 'MINING' o 'CLAIMABLE', iniciamos el temporizador para calcular el progreso.
    const interval = setInterval(() => {
      const now = Date.now();
      const secondsPassed = Math.max(0, Math.floor((now - startTime) / 1000));

      // --- LÓGICA DE CICLO COMPLETADO ---
      if (secondsPassed >= CLAIM_CYCLE_SECONDS) {
        setAccumulatedNtx(miningRate); // Al final del ciclo, se muestra la ganancia diaria total.
        setCountdown('00:00:00');
        setProgress(100);
        setIsClaimable(true); // Se activa la posibilidad de reclamar.
        clearInterval(interval); // Detenemos el intervalo una vez completado.
        return;
      }

      // --- LÓGICA DE CICLO EN PROGRESO ---
      // La ganancia se calcula en tiempo real. (TasaDiaria / SegundosEnUnDia) * SegundosTranscurridos
      const currentAccumulation = (miningRate / CLAIM_CYCLE_SECONDS) * secondsPassed;
      setAccumulatedNtx(currentAccumulation);
      
      setIsClaimable(false); // Aún no se puede reclamar.

      // Cálculo del tiempo restante para la cuenta regresiva.
      const secondsRemaining = CLAIM_CYCLE_SECONDS - secondsPassed;
      const hours = Math.floor(secondsRemaining / 3600);
      const minutes = Math.floor((secondsRemaining % 3600) / 60);
      const seconds = secondsRemaining % 60;
      setCountdown(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
      
      // Cálculo del progreso para la barra.
      const currentProgress = (secondsPassed / CLAIM_CYCLE_SECONDS) * 100;
      setProgress(currentProgress);

    }, 1000); // El intervalo se ejecuta cada segundo.

    // Función de limpieza para detener el intervalo si el componente se desmonta.
    return () => clearInterval(interval);

  }, [startTime, miningRate, miningStatus]); // El hook se re-ejecuta si cambia alguna de estas dependencias.

  // Devolvemos todos los valores que la UI necesita para renderizarse.
  return { accumulatedNtx, countdown, progress, isClaimable };
};