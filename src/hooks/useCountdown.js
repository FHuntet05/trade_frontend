// RUTA: frontend/src/hooks/useCountdown.js
// --- INICIO DEL NUEVO HOOK REUTILIZABLE ---

import { useState, useEffect, useMemo } from 'react';

/**
 * Helper para formatear un número a dos dígitos, añadiendo un cero si es necesario.
 * Ejemplo: 7 -> "07"
 * @param {number} num - El número a formatear.
 * @returns {string}
 */
const padWithZero = (num) => String(num).padStart(2, '0');

/**
 * Hook personalizado que calcula el tiempo restante hasta una fecha objetivo.
 *
 * @param {string | null | undefined} targetDate - La fecha objetivo en formato de string ISO (ej: "2025-12-31T23:59:59Z").
 * @returns {{timeLeft: string, isFinished: boolean}} - Un objeto que contiene:
 *   - `timeLeft`: El tiempo restante formateado como "HH:MM:SS".
 *   - `isFinished`: Un booleano que es `true` si el temporizador ha finalizado o si no se proporcionó una fecha.
 */
const useCountdown = (targetDate) => {
  // `useMemo` previene que la fecha se recalcule en cada render si el string no ha cambiado.
  const countDownDate = useMemo(() => {
    if (!targetDate) return null;
    const date = new Date(targetDate);
    // Se valida que la fecha sea un número válido antes de retornarla.
    return isNaN(date.getTime()) ? null : date.getTime();
  }, [targetDate]);

  // Estado para almacenar el tiempo restante formateado.
  const [timeLeft, setTimeLeft] = useState('--:--:--');
  // Estado para saber si el contador ha terminado.
  const [isFinished, setIsFinished] = useState(!countDownDate);

  useEffect(() => {
    // Si no hay una fecha objetivo válida, no se inicia el intervalo.
    if (!countDownDate) {
      setIsFinished(true);
      return;
    }

    // Se establece un intervalo que se ejecuta cada segundo.
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = countDownDate - now;

      // Si la distancia es negativa, el tiempo ha expirado.
      if (distance <= 0) {
        clearInterval(interval); // Se limpia el intervalo para detener el contador.
        setIsFinished(true);
        setTimeLeft('00:00:00');
      } else {
        // Se calculan las horas, minutos y segundos a partir de la distancia en milisegundos.
        const hours = Math.floor(distance / (1000 * 60 * 60)); // Horas totales
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Se actualiza el estado con el tiempo formateado.
        setTimeLeft(`${padWithZero(hours)}:${padWithZero(minutes)}:${padWithZero(seconds)}`);
        setIsFinished(false);
      }
    }, 1000);

    // Función de limpieza: Se ejecuta cuando el componente que usa el hook se desmonta.
    // Es CRÍTICO para prevenir fugas de memoria.
    return () => clearInterval(interval);

  }, [countDownDate]); // El efecto se vuelve a ejecutar solo si la fecha objetivo cambia.

  return { timeLeft, isFinished };
};

export default useCountdown;

// --- FIN DEL NUEVO HOOK REUTILIZABLE ---