// frontend/src/pages/admin/components/AdjustBalanceModal.jsx (COMPLETO)

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const modalVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 25 } },
  exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } },
};

const AdjustBalanceModal = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'admin_credit',
    currency: 'USDT',
    amount: '',
    reason: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0 || !formData.reason) {
      toast.error('Todos los campos son obligatorios y el monto debe ser positivo.');
      return;
    }
    onSave(user._id, { ...formData, amount: Number(formData.amount) });
  };

  if (!user) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      initial="hidden" animate="visible" exit="hidden" onClick={onClose}
    >
      <motion.div
        variants={modalVariants} onClick={(e) => e.stopPropagation()}
        className="relative bg-dark-secondary rounded-2xl border border-white/10 w-full max-w-lg text-white"
      >
        <header className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Ajustar Saldo: <span className="text-accent-start">{user.username}</span></h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20"><HiXMark className="w-6 h-6" /></button>
        </header>
        <form onSubmit={handleSubmit}>
          <main className="p-6 space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-text-secondary">Tipo de Operación</label>
              <select name="type" value={formData.type} onChange={handleChange} className="bg-black/20 border border-white/10 text-white text-sm rounded-lg w-full p-2.5">
                <option value="admin_credit">Acreditar (Añadir)</option>
                <option value="admin_debit">Debitar (Quitar)</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-text-secondary">Moneda</label>
              <select name="currency" value={formData.currency} onChange={handleChange} className="bg-black/20 border border-white/10 text-white text-sm rounded-lg w-full p-2.5">
                <option value="USDT">USDT</option>
                <option value="NTX">NTX</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-text-secondary">Monto</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="bg-black/20 border border-white/10 text-white text-sm rounded-lg w-full p-2.5" step="0.01" placeholder="Ej: 50.25" />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-text-secondary">Motivo del Ajuste</label>
              <input type="text" name="reason" value={formData.reason} onChange={handleChange} className="bg-black/20 border border-white/10 text-white text-sm rounded-lg w-full p-2.5" placeholder="Ej: Bono por participación" />
            </div>
          </main>
          <footer className="p-6 border-t border-white/10 text-right">
            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-accent-start to-accent-end text-white font-bold rounded-lg">Confirmar Ajuste</button>
          </footer>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdjustBalanceModal;