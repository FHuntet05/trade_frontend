// RUTA: frontend/src/pages/admin/components/ToolFormModal.jsx (VERSIÓN "NEXUS - FREE TOOL ENABLED")
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const modalVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 200 } },
    exit: { y: 50, opacity: 0 }
};

const ToolFormModal = ({ factory, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    vipLevel: '',
    price: '',
    miningBoost: '', 
    durationDays: '',
    imageUrl: '',
    isFree: false // [NEXUS ONBOARDING FIX] El campo 'isFree' es ahora central.
  });

  const isEditing = !!factory;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: factory.name || '',
        vipLevel: factory.vipLevel || '',
        price: factory.isFree ? 0 : (factory.price || ''), // Si es gratis, el precio es 0.
        miningBoost: factory.miningBoost || '', 
        durationDays: factory.durationDays || '',
        imageUrl: factory.imageUrl || '',
        isFree: factory.isFree || false
      });
    }
  }, [factory, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = { ...formData, [name]: type === 'checkbox' ? checked : value };

    // [NEXUS ONBOARDING FIX] Lógica para auto-gestionar el precio.
    // Si se marca como gratuito, el precio se establece en 0.
    if (name === 'isFree' && checked) {
        newFormData.price = '0';
    }

    setFormData(newFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // [NEXUS ONBOARDING FIX] Se envía el objeto completo, incluyendo 'isFree'.
    const dataToSend = {
      name: formData.name,
      vipLevel: Number(formData.vipLevel),
      price: Number(formData.price),
      miningBoost: Number(formData.miningBoost),
      durationDays: Number(formData.durationDays),
      imageUrl: formData.imageUrl,
      isFree: formData.isFree, 
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
          <header className="flex justify-between items-center p-6 border-b border-white/10">
            <h2 className="text-xl font-bold">{isEditing ? 'Editar Fábrica' : 'Crear Nueva Fábrica'}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20"><HiXMark className="w-6 h-6" /></button>
          </header>

          <form onSubmit={handleSubmit}>
            <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-text-secondary">Nombre de la Fábrica</label>
                <input name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md border border-white/10" required autoFocus />
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary">Precio (USDT)</label>
                {/* [NEXUS ONBOARDING FIX] El campo de precio se deshabilita si 'isFree' es true. */}
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md border border-white/10 disabled:opacity-50" step="0.01" required disabled={formData.isFree} />
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Nivel VIP</label>
                <input type="number" name="vipLevel" value={formData.vipLevel} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md border border-white/10" required />
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Potencia (NTX/Día)</label>
                <input type="number" name="miningBoost" value={formData.miningBoost} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md border border-white/10" step="0.01" required />
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Duración (Días)</label>
                <input type="number" name="durationDays" value={formData.durationDays} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md border border-white/10" required />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-text-secondary">URL de la Imagen</label>
                <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full mt-1 p-2 bg-black/20 rounded-md border border-white/10" required />
              </div>

              {/* [NEXUS ONBOARDING FIX] El checkbox ahora es completamente funcional. */}
              <div className="md:col-span-2 flex items-center justify-start gap-3 pt-2">
                <input type="checkbox" id="isFree" name="isFree" checked={formData.isFree} onChange={handleChange} className="h-5 w-5 rounded bg-black/20 text-accent-start focus:ring-accent-start border-gray-500" />
                <label htmlFor="isFree" className="text-sm font-medium text-text-secondary">Marcar como Herramienta Gratuita de Inicio</label>
              </div>

            </main>
            
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