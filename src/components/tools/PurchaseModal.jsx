// src/components/tools/PurchaseModal.jsx (VERSIÓN FINAL, ALINEADA CON EL NUEVO FLUJO)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiXMark, HiOutlineCreditCard, HiOutlineCurrencyDollar } from 'react-icons/hi2';
import useUserStore from '../../store/userStore';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';

// --- CAMBIO: El prop ahora es 'onSelectCrypto' para alinearse con ToolsPage.jsx ---
const PurchaseFlowModal = ({ tool, onClose, onSelectCrypto }) => {
  const { user, updateUser } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // --- CAMBIO: La lógica de cantidad se elimina. El costo es fijo. ---
  const totalCost = tool?.price || 0;
  const userBalance = user?.balance?.usdt || 0;
  const canPayWithBalance = userBalance >= totalCost;

  // --- LÓGICA DE PAGO CON SALDO INTERNO (simplificada) ---
  const handlePayWithBalance = async () => {
    setIsProcessing(true);
    toast.loading('Procesando pago con saldo...', { id: 'payment' });
    try {
      const response = await api.post('/wallet/purchase-with-balance', {
        toolId: tool._id,
        // La cantidad ya no es necesaria, se asume 1 en el backend o se elimina de la ruta.
        // Si el backend aún la requiere, la enviamos como 1.
        quantity: 1, 
      });
      updateUser(response.data.user);
      toast.success(response.data.message, { id: 'payment' });
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al procesar el pago.';
      toast.error(errorMessage, { id: 'payment' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <motion.div
          className="bg-dark-secondary border border-white/10 rounded-2xl w-full max-w-sm text-white p-6 relative"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <button className="absolute top-4 right-4 text-text-secondary hover:text-white" onClick={onClose}><HiXMark className="w-6 h-6" /></button>
          
          <h2 className="text-xl font-bold text-center mb-2">{tool.name}</h2>
          <img src={tool.imageUrl || '/assets/images/tool-placeholder.png'} alt={tool.name} className="w-20 h-20 mx-auto my-4 object-contain" />

          {/* --- CAMBIO: Resumen simplificado sin cantidad --- */}
          <div className="space-y-2 text-sm my-4">
            <div className="flex justify-between items-center bg-dark-primary/50 p-3 rounded-lg">
                <span className="text-text-secondary">Precio</span>
                <span className="font-bold text-xl text-white">{totalCost.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between items-center bg-dark-primary/50 p-3 rounded-lg">
                <span className="text-text-secondary">Tu Saldo</span>
                <span className={`font-bold text-xl ${canPayWithBalance ? 'text-green-400' : 'text-red-400'}`}>{userBalance.toFixed(2)} USDT</span>
            </div>
          </div>
        
          {/* --- INICIO DE LA NUEVA LÓGICA DE BOTONES CONDICIONALES --- */}
          <div className="mt-6">
            {canPayWithBalance ? (
              // Opción 1: El usuario tiene saldo suficiente
              <button 
                onClick={handlePayWithBalance} 
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-3 p-3 rounded-full bg-gradient-to-r from-accent-start to-accent-end text-white font-bold disabled:bg-gray-600 disabled:opacity-50 transition-all shadow-glow transform active:scale-95"
              >
                <HiOutlineCurrencyDollar className="w-6 h-6" />
                <span>Pagar con Saldo</span>
              </button>
            ) : (
              // Opción 2: El usuario NO tiene saldo suficiente
              <button 
                onClick={onSelectCrypto} // <-- Llama a la función del nuevo flujo
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-3 p-3 rounded-full bg-blue-500/80 text-white font-bold disabled:bg-gray-600 disabled:opacity-50 transition-all"
              >
                <HiOutlineCreditCard className="w-6 h-6" />
                <span>Pagar con Criptomoneda</span>
              </button>
            )}
          </div>
          {/* --- FIN DE LA NUEVA LÓGICA DE BOTONES CONDICIONALES --- */}

      </motion.div>
    </div>
  );
};
export default PurchaseFlowModal;