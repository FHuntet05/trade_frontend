// frontend/src/pages/admin/components/SweepConfirmationModal.jsx (NUEVO v18.1)
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineKey, HiOutlineWallet, HiXMark } from 'react-icons/hi2';

const SweepConfirmationModal = ({ isOpen, onClose, onConfirm, context }) => {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!recipientAddress || !adminPassword) return;
    onConfirm({
      chain: context.chain,
      token: context.token,
      recipientAddress,
      adminPassword, // Aunque el backend no lo use directamente, es buena práctica para el futuro o logging
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-dark-secondary rounded-lg border border-white/10 w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Confirmar Barrido de Fondos</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-dark-tertiary">
                <HiXMark className="w-6 h-6" />
              </button>
            </div>
            <p className="text-text-secondary mb-4">
              Estás a punto de iniciar un barrido masivo de <span className="font-bold text-accent-start">{context.token}</span> en la red <span className="font-bold text-accent-start">{context.chain}</span>. Esta acción es irreversible.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="recipientAddress" className="block text-sm font-medium text-text-secondary mb-1">Dirección de Destino</label>
                <div className="relative">
                  <HiOutlineWallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    id="recipientAddress"
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder={`Dirección ${context.chain} donde recibir los fondos`}
                    className="w-full bg-dark-tertiary border border-white/10 rounded-md p-2 pl-10 focus:ring-2 focus:ring-accent-start focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="adminPassword" className="block text-sm font-medium text-text-secondary mb-1">Tu Contraseña de Administrador</label>
                <div className="relative">
                  <HiOutlineKey className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    id="adminPassword"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Contraseña para confirmar"
                    className="w-full bg-dark-tertiary border border-white/10 rounded-md p-2 pl-10 focus:ring-2 focus:ring-accent-start focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button onClick={onClose} className="w-full py-2 rounded-md bg-dark-tertiary hover:bg-white/10 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!recipientAddress || !adminPassword}
                className="w-full py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
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