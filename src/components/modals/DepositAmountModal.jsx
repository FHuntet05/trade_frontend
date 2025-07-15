// frontend/src/components/modals/DepositAmountModal.jsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 150, damping: 25 } },
  exit: { y: "100%", opacity: 0, transition: { duration: 0.3 } },
};

const DepositAmountModal = ({ onProceed, onClose }) => {
  const [amount, setAmount] = useState('');
  const MINIMUM_DEPOSIT = 10; // Establecemos un mínimo de depósito de 10 USDT

  const handleProceed = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < MINIMUM_DEPOSIT) {
      toast.error(`El monto mínimo de recarga es ${MINIMUM_DEPOSIT} USDT.`);
      return;
    }
    onProceed(numericAmount);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end items-end z-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="bg-dark-primary w-full max-w-lg rounded-t-2xl border-t border-white/10 flex flex-col p-6"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recargar Saldo</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <HiXMark className="w-6 h-6 text-white" />
          </button>
        </header>
        
        <main className="flex-grow space-y-4">
          <p className="text-text-secondary">
            Introduce la cantidad en USDT que deseas depositar en tu cuenta.
          </p>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Mínimo ${MINIMUM_DEPOSIT}`}
              className="w-full bg-black/20 text-white text-2xl font-bold p-4 rounded-lg border-2 border-transparent focus:border-accent-start focus:outline-none"
              autoFocus
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-text-secondary">USDT</span>
          </div>
        </main>

        <footer className="mt-6">
            <button
                onClick={handleProceed}
                disabled={!amount}
                className="w-full py-3 bg-gradient-to-r from-accent-start to-accent-end text-white text-lg font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
                Continuar
            </button>
        </footer>
      </motion.div>
    </motion.div>
  );
};

export default DepositAmountModal;