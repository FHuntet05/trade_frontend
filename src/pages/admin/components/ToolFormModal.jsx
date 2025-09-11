// RUTA: admin-frontend/src/pages/admin/components/ToolFormModal.jsx (v50.0 - VERSIÓN "BLOCKSPHERE" FINAL)
// ARQUITECTURA: Formulario modal basado en el Modelo, con los campos requeridos para las Fábricas.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';

// --- Variantes de Animación ---
const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const modalVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 200 } },
    exit: { y: 50, opacity: 0 }
};

const ToolFormModal = ({ factory, onSave, onClose }) => {
  // --- Estado del Formulario ---
  const [formData, setFormData] = useState({
    name: '',
    vipLevel: '',
    price: '',
    dailyProduction: '',
    durationDays: '',
    imageUrl: '',
    isFree: false
  });

  const isEditing = !!factory;

  // Poblar el formulario si estamos editando una fábrica existente.
  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: factory.name || '',
        vipLevel: factory.vipLevel || '',
        price: factory.price || '',
        dailyProduction: factory.dailyProduction || '',
        durationDays: factory.durationDays || '',
        imageUrl: factory.imageUrl || '',
        isFree: factory.isFree || false
      });
    }
  }, [factory, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prepara los datos para ser enviados, asegurando que los valores numéricos sean del tipo correcto.
    const dataToSend = {
        ...formData,
        vipLevel: Number(formData.vipLevel),
        price: Number(formData.price),
        dailyProduction: Number(formData.dailyProduction),
        durationDays: Number(formData.durationDays)
    };
    onSave(dataToSend, factory?._id);
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" 
        variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
        onClick={onClose}
      >
        <motion.div 
            variants={modalVariants} 
            onClick={(e) => e.stopPropagation()} 
            className="relative bg-dark-secondary rounded-2xl border border-white/10 w-full max-w-lg text-white shadow-xl"
        >
          {/* --- Encabezado --- */}
          <header className="flex justify-between items-center p-6 border-b border-white/10">
            <h2 className="text-xl font-bold">{isEditing ? 'Editar Fábrica' : 'Crear Nueva Fábrica'}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20"><HiXMark className="w-6 h-6" /></button>
          </header>

          {/* --- Formulario --- */}
          <form onSubmit={handleSubmit}>
            <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-text-secondary">Nombre de la Fábrica</label>
                <input name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md border border-white/10" required autoFocus />
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary">Precio (USDT)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md border border-white/10" step="0.01" required />
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Nivel VIP Requerido</label>
                <input type="number" name="vipLevel" value={formData.vipLevel} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md border border-white/10" required />
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Producción (USDT/Día)</label>
                <input type="number" name="dailyProduction" value={formData.dailyProduction} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md border border-white/10" step="0.01" required />
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Duración (Días)</label>
                <input type="number" name="durationDays" value={formData.durationDays} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md border border-white/10" required />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-text-secondary">URL de la Imagen</label>
                <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md border border-white/10" required />
              </div>

              <div className="md:col-span-2 flex items-center justify-start gap-3 pt-2">
                <input type="checkbox" id="isFree" name="isFree" checked={formData.isFree} onChange={handleChange} className="h-5 w-5 rounded bg-black/20 text-accent-start focus:ring-accent-start border-gray-500" />
                <label htmlFor="isFree" className="text-sm font-medium text-text-secondary">Marcar como Gratuita</label>
              </div>

            </main>
            
            {/* --- Pie de Página con Botón de Acción --- */}
            <footer className="p-6 border-t border-white/10 text-right">
              <button type="submit" className="px-6 py-2 bg-gradient-to-r from-accent-start to-accent-end text-white font-bold rounded-lg hover:opacity-90 transition-opacity">
                {isEditing ? 'Guardar Cambios' : 'Crear Fábrica'}
              </button>
            </footer>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ToolFormModal;