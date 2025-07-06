// frontend/src/components/home/RealTimeClock.jsx
import React, { useState, useEffect } from 'react';

const RealTimeClock = () => {
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateClock = () => {
            // Creamos un objeto de fecha y le aplicamos el offset GMT-4
            const date = new Date();
            const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
            const gmtMinus4 = new Date(utc + (3600000 * -4));

            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            };
            setTime(gmtMinus4.toLocaleString('es-ES', options));
        };
        
        updateClock();
        const intervalId = setInterval(updateClock, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="text-center text-xs text-text-secondary font-mono tracking-widest">
            {time} (GMT-4)
        </div>
    );
};

export default RealTimeClock;