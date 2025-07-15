// frontend/src/pages/admin/components/ToolFormModal.jsx (COMPLETO)
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const modalVariants = { /* ... */ };
const ToolFormModal = ({ tool, onSave, onClose }) => {
  const [formData, setFormData] = useState({ name: '', vipLevel: '', price: '', miningBoost: '', durationDays: '', imageUrl: '' });
  const isEditing = !!tool;

  useEffect(() => { if (tool) setFormData(tool); }, [tool]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSave(formData, tool?._id); };

  return (
    <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" initial="hidden" animate="visible" exit="hidden" onClick={onClose}>
      <motion.div variants={modalVariants} onClick={(e) => e.stopPropagation()} className="relative bg-dark-secondary rounded-2xl border border-white/10 w-full max-w-lg text-white">
        <header className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">{isEditing ? 'Editar Herramienta' : 'Crear Nueva Herramienta'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20"><HiXMark className="w-6 h-6" /></button>
        </header>
        <form onSubmit={handleSubmit}>
          <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label>Nombre</label><input name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md" required /></div>
            <div><label>VIP Level</label><input type="number" name="vipLevel" value={formData.vipLevel} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md" required /></div>
            <div><label>Precio (USDT)</label><input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md" step="0.01" required /></div>
            <div><label>Ganancia NTX/Día</label><input type="number" name="miningBoost" value={formData.miningBoost} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md" required /></div>
            <div><label>Duración (Días)</label><input type="number" name="durationDays" value={formData.durationDays} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md" required /></div>
            <div className="md:col-span-2"><label>URL de Imagen</label><input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md" required /></div>
          </main>
          <footer className="p-6 border-t border-white/10 text-right"><button type="submit" className="px-6 py-2 bg-gradient-to-r from-accent-start to-accent-end text-white font-bold rounded-lg">Guardar</button></footer>
        </form>
      </motion.div>
    </motion.div>
  );
};
export default ToolFormModal;