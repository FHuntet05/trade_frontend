// RUTA: frontend/src/pages/admin/components/SweepConfirmationModal.jsx (VERSIÓN "NEXUS - LÓGICA DE DESTINO DINÁMICO")
// ARQUITECTURA: Modal adaptado para un flujo de backend más seguro con destino dinámico para USDT.

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineExclamationTriangle, HiXMark } from 'react-icons/hi2';

// --- Variantes de Animación ---
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants = {
    hidden: { scale: 0.95, y: 20, opacity: 0 },
    visible: { scale: 1, y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 180 } },
    exit: { scale: 0.95, y: 20, opacity: 0, transition: { duration: 0.2 } },
};


const SweepConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    context,
    // [NEXUS] Nuevas props para la dirección de destino dinámica
    recipientAddress,
    setRecipientAddress
}) => {
  if (!isOpen || !context) return null;

  const { chain, token, walletsCandidatas, totalUsdtToSweep } = context;

  // [NEXUS] Validación básica en el modal, la validación principal es en la página y en el backend.
  const isRecipientAddressValid = recipientAddress && /^0x[a-fA-F0-9]{40}$/.test(recipientAddress);

  const handleConfirm = () => {
    // [NEXUS] Solo confirmamos si la dirección es válida (solo para USDT)
    if (token === 'USDT' && !isRecipientAddressValid) {
        // Esto debería ser manejado por el toast en AdminTreasuryPage, pero es un fallback.
        alert('Por favor, introduzca una dirección de destino válida.');
        return;
    }
    onConfirm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-dark-secondary rounded-lg border border-white/10 w-full max-w-md p-6 shadow-2xl"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold">Confirmar Barrido de Fondos</h2>
                    <p className="text-sm text-text-secondary">Esta acción es irreversible.</p>
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-dark-tertiary transition-colors"><HiXMark className="w-6 h-6" /></button>
            </div>
            
            <div className="bg-yellow-900/20 border border-yellow-500/50 text-yellow-300 p-4 rounded-lg flex items-start gap-3 mb-4">
              <HiOutlineExclamationTriangle className="w-10 h-10 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold">¡Atención!</h3>
                <p className="text-sm">
                    Estás a punto de iniciar un barrido masivo de {token} en la red {chain}. 
                    {token === 'USDT' 
                        ? " Deberás especificar una dirección de destino para estos fondos." 
                        : " Los fondos de gas serán transferidos a la wallet central segura del sistema."
                    }
                </p>
              </div>
            </div>
            
            <div className="bg-dark-tertiary border border-accent-start/20 rounded-md p-4 mb-6">
              <p className="text-lg font-semibold mt-1 text-center">
                Total a Barrer: <span className="text-white font-mono">{totalUsdtToSweep.toFixed(4)} {token}</span>
              </p>
              <p className="text-sm text-text-secondary text-center">
                Desde <span className="text-white font-bold">{walletsCandidatas.length}</span> wallets de depósito.
              </p>
            </div>

            {/* [NEXUS] Campo de entrada para la dirección de destino, solo para USDT */}
            {token === 'USDT' && (
                <div className="mb-6">
                    <label htmlFor="recipientAddress" className="block text-sm font-medium text-text-secondary mb-2">
                        Dirección de Destino para USDT (BSC)
                    </label>
                    <input
                        type="text"
                        id="recipientAddress"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="Ej: 0xAbc123..."
                        className={`w-full p-3 rounded-md bg-dark-tertiary border ${isRecipientAddressValid ? 'border-gray-600' : 'border-red-500'} focus:outline-none focus:ring-1 focus:ring-accent-start text-white font-mono`}
                    />
                    {!isRecipientAddressValid && recipientAddress && (
                        <p className="text-red-400 text-xs mt-1">Dirección inválida. Asegúrese de que sea una dirección BSC ERC-20 válida.</p>
                    )}
                </div>
            )}
            
            <div className="mt-6 flex gap-4">
              <button onClick={onClose} className="w-full py-2.5 rounded-md bg-dark-tertiary hover:bg-white/10 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                // [NEXUS] Deshabilitar si es USDT y la dirección no es válida
                disabled={token === 'USDT' && !isRecipientAddressValid}
                className="w-full py-2.5 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-600"
              >
                Confirmar y Barrer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SweepConfirmationModal;