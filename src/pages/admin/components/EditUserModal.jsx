// frontend/src/pages/admin/components/EditUserModal.jsx (COMPLETO)

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 25 } },
  exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } },
};

const EditUserModal = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    role: 'user',
    balanceUsdt: 0,
    balanceNtx: 0,
  });

  // Cuando el modal se abre, poblamos el formulario con los datos del usuario
  useEffect(() => {
    if (user) {
      setFormData({
        role: user.role,
        balanceUsdt: user.balance.usdt,
        balanceNtx: user.balance.ntx,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Convertimos a número si el campo es de balance
      [name]: name.includes('balance') ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user._id, formData);
  };

  if (!user) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="relative bg-dark-secondary rounded-2xl border border-white/10 w-full max-w-lg text-white"
        variants={modalVariants} onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Editar Usuario: <span className="text-accent-start">{user.username}</span></h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <HiXMark className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <main className="p-6 space-y-4">
            {/* Campo Rol */}
            <div>
              <label htmlFor="role" className="block mb-2 text-sm font-medium text-text-secondary">Rol</label>
              <select name="role" id="role" value={formData.role} onChange={handleChange} className="bg-black/20 border border-white/10 text-white text-sm rounded-lg focus:ring-accent-start focus:border-accent-start block w-full p-2.5">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {/* Campo Balance USDT */}
            <div>
              <label htmlFor="balanceUsdt" className="block mb-2 text-sm font-medium text-text-secondary">Balance (USDT)</label>
              <input type="number" name="balanceUsdt" id="balanceUsdt" value={formData.balanceUsdt} onChange={handleChange} className="bg-black/20 border border-white/10 text-white text-sm rounded-lg focus:ring-accent-start focus:border-accent-start block w-full p-2.5" step="0.01" />
            </div>
            {/* Campo Balance NTX */}
            <div>
              <label htmlFor="balanceNtx" className="block mb-2 text-sm font-medium text-text-secondary">Balance (NTX)</label>
              <input type="number" name="balanceNtx" id="balanceNtx" value={formData.balanceNtx} onChange={handleChange} className="bg-black/20 border border-white/10 text-white text-sm rounded-lg focus:ring-accent-start focus:border-accent-start block w-full p-2.5" step="1" />
            </div>
          </main>
          
          <footer className="p-6 border-t border-white/10 text-right">
            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-accent-start to-accent-end text-white font-bold rounded-lg hover:opacity-90 transition-opacity">
              Guardar Cambios
            </button>
          </footer>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditUserModal;