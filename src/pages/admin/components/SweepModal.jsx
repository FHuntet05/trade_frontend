// frontend/src/pages/admin/components/SweepModal.jsx (COMPLETO)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiXMark, HiOutlineShieldExclamation } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const SweepModal = ({ currency, balance, onSweep, onClose }) => {
  const [destinationAddress, setDestinationAddress] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destinationAddress || !adminPassword) {
      toast.error('La dirección de destino y la contraseña son obligatorias.');
      return;
    }
    onSweep({ currency, destinationAddress, adminPassword });
  };

  return (
    <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" initial="hidden" animate="visible" exit="hidden" onClick={onClose}>
      <motion.div className="relative bg-dark-secondary rounded-2xl border border-white/10 w-full max-w-lg text-white" initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Confirmar Barrido de <span className="text-accent-start">{currency}</span></h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20"><HiXMark className="w-6 h-6" /></button>
        </header>
        <form onSubmit={handleSubmit}>
          <main className="p-6 space-y-4">
            <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-start gap-3">
              <HiOutlineShieldExclamation className="w-10 h-10 flex-shrink-0" />
              <div>
                <h3 className="font-bold">¡Acción de Alta Seguridad!</h3>
                <p className="text-sm">Estás a punto de transferir la totalidad del saldo de esta hot wallet. Esta acción es irreversible. Asegúrate de que la dirección de destino sea correcta y segura (preferiblemente una cold wallet).</p>
              </div>
            </div>
            <p className="text-lg">Balance a barrer: <strong className="font-mono text-white">{balance} {currency}</strong></p>
            <div>
              <label className="block mb-2 text-sm font-medium text-text-secondary">Dirección de Destino ({currency})</label>
              <input type="text" value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} className="w-full p-2 bg-black/20 rounded-md" placeholder="Pega la dirección de la cold wallet aquí" required />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-text-secondary">Tu Contraseña de Administrador</label>
              <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-2 bg-black/20 rounded-md" placeholder="Contraseña para confirmar" required />
            </div>
          </main>
          <footer className="p-6 border-t border-white/10 text-right">
            <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">Confirmar y Ejecutar Barrido</button>
          </footer>
        </form>
      </motion.div>
    </motion.div>
  );
};
export default SweepModal;