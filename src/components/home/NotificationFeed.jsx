// frontend/src/components/home/NotificationFeed.jsx (VERSIÓN MEJORADA)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowDownTray, HiBanknotes, HiArrowPath } from 'react-icons/hi2';

const firstNames = ["Alex", "Maria", "John", "Sofia", "David", "Liam", "Neuro", "Cris", "Eva", "Luis"];
const actions = [
  { text: "retirado", icon: <HiArrowDownTray className="inline mr-1 text-red-400" />, currency: "USDT" },
  { text: "reclamado", icon: <HiBanknotes className="inline mr-1 text-green-400" />, currency: "NTX" },
  { text: "intercambiado", icon: <HiArrowPath className="inline mr-1 text-blue-400" />, currency: "NTX por USDT" }
];

const generateRandomNotification = () => {
  const name = firstNames[Math.floor(Math.random() * firstNames.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const amount = (Math.random() * 500).toFixed(2);
  const censoredName = `${name.slice(0, 2)}****${name.slice(-1)}`;
  
  return {
    id: Date.now() + Math.random(),
    content: (
      <>
        {censoredName} ha {action.text} {action.icon} {amount} {action.currency}
      </>
    )
  };
};

const NotificationFeed = () => {
    const [notification, setNotification] = useState(generateRandomNotification);

    useEffect(() => {
        const interval = setInterval(() => {
            setNotification(generateRandomNotification());
        }, 4500); // Cambia cada 4.5 segundos

        return () => clearInterval(interval);
    }, []);

    return (
        // El contenedor ahora ocupa más ancho y centra el contenido
        <div className="w-full max-w-md mx-auto h-10 flex items-center justify-center overflow-hidden px-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={notification.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    // Estilo mejorado: más ancho, "glassmorphism" blanco
                    className="bg-white/10 text-text-secondary text-sm px-4 py-2 rounded-full backdrop-blur-lg w-full text-center border border-white/10"
                >
                    {notification.content}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default NotificationFeed;