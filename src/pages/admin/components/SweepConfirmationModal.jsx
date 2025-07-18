// RUTA: frontend/src/pages/admin/components/SweepConfirmationModal.jsx (VERSIÓN BARRIDO INTELIGENTE)

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineKey, HiOutlineWallet, HiXMark, HiInformationCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const SweepConfirmationModal = ({ isOpen, onClose, onConfirm, context }) => {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Resetea los campos cuando el modal se cierra o el contexto cambia
  useEffect(() => {
    if (!isOpen) {
      setRecipientAddress('');
      setAdminPassword('');
    }
  }, [isOpen]);
  
  if (!isOpen || !context) return null;

  const { chain, token, walletsCandidatas, totalUsdtToSweep } = context;
  const hasCandidates = walletsCandidatas && walletsCandidatas.length > 0;

  const handleConfirm = () => {
    if (!recipientAddress || !adminPassword) {
      toast.error("Por favor, complete la dirección de destino y la contraseña.");
      return;
    }
    if (!hasCandidates) {
      toast.error("No hay wallets elegibles para barrer.");
      return;
    }
    onConfirm({
      chain,
      token,
      recipientAddress,
      adminPassword,
      walletsToSweep: walletsCandidatas.map(w => w.address),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-dark-secondary rounded-lg border border-white/10 w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Confirmar Barrido de Fondos</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-dark-tertiary transition-colors">
                <HiXMark className="w-6 h-6" />
              </button>
            </div>
            
            <div className="bg-dark-tertiary border border-accent-start/20 rounded-md p-4 mb-4">
              <p className="text-text-secondary">
                Estás a punto de iniciar un barrido masivo de <span className="font-bold text-accent-start">{token}</span> en la red <span className="font-bold text-accent-start">{chain}</span>.
              </p>
              {hasCandidates ? (
                <p className="text-lg font-semibold mt-2">
                  Se barrerán <span className="text-white">{totalUsdtToSweep.toFixed(4)} {token}</span> desde <span className="text-white">{walletsCandidatas.length}</span> wallets.
                </p>
              ) : (
                 <div className="mt-2 flex items-center gap-2 text-yellow-400">
                    <HiInformationCircle className="w-5 h-5"/>
                    <p>No se encontraron wallets con fondos y gas suficiente.</p>
                 </div>
              )}
            </div>
            
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
                    placeholder={`Dirección ${chain} donde recibir los fondos`}
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
                disabled={!recipientAddress || !adminPassword || !hasCandidates}
                className="w-full py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
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