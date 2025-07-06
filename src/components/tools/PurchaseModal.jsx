// src/components/tools/PurchaseModal.jsx (CÓDIGO COMPLETO Y FUNCIONAL)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiXMark, HiMinus, HiPlus, HiOutlineCreditCard, HiOutlineCurrencyDollar } from 'react-icons/hi2';
import useUserStore from '../../store/userStore';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';

const PurchaseFlowModal = ({ tool, onClose, onShowInvoice }) => {
  const { user, updateUser } = useUserStore();
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const totalCost = (tool?.price || 0) * quantity;
  const userBalance = user?.balance?.usdt || 0;
  const canPayWithBalance = userBalance >= totalCost;

  // --- LÓGICA DE PAGO CON SALDO INTERNO ---
  const handlePayWithBalance = async () => {
    setIsProcessing(true);
    toast.loading('Procesando pago con saldo...', { id: 'payment' });
    try {
        const response = await api.post('/wallet/purchase-with-balance',{
        toolId: tool._id,
        quantity: quantity,
      });
      // Sincronizamos el estado del usuario con la respuesta del backend
      updateUser(response.data.user); 
      toast.success(response.data.message, { id: 'payment' });
      onClose(); // Cerramos el modal en caso de éxito
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al procesar el pago.';
      toast.error(errorMessage, { id: 'payment' });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- LÓGICA DE PAGO CON CRIPTOMONEDA ---
  const handlePayWithCrypto = async () => {
    setIsProcessing(true);
    toast.loading('Generando factura...', { id: 'payment' });
    try {
      const response = await api.post('/wallet/create-purchase-invoice', {
        toolId: tool._id,
        quantity: quantity,
      });
      // La API devuelve los datos de la factura
      const invoiceData = response.data;
      toast.dismiss('payment'); // Cerramos el toast de "Generando..."
      onShowInvoice(invoiceData); // Pasamos los datos al siguiente modal
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al generar la factura.';
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
          
          <h2 className="text-xl font-bold text-center mb-2">{`Herramienta de aceleración de minería ${tool.vipLevel}`}</h2>
          <img src={tool.imageUrl || '/assets/tool-icon-placeholder.png'} alt={tool.name} className="w-20 h-20 mx-auto my-4 object-contain" />

          <div className="space-y-2 text-sm my-4">
            <div className="flex justify-between"><span className="text-text-secondary">Precio Unitario</span><span>{tool.price.toFixed(2)} USDT</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Saldo disponible</span><span>{userBalance.toFixed(2)} USDT</span></div>
          </div>
          
          <div className="flex justify-between items-center bg-dark-primary/50 p-3 rounded-lg my-6">
            <span className="font-semibold">Cantidad</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-xl p-1 rounded-full hover:bg-white/10"><HiMinus /></button>
              <span className="text-lg font-bold w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="text-xl p-1 rounded-full hover:bg-white/10"><HiPlus /></button>
            </div>
        </div>
        <p className="text-center text-text-secondary mb-6">Costo Total: <span className="font-bold text-2xl text-white">{totalCost.toFixed(2)} USDT</span></p>
        
        <div className="space-y-4">
          <button 
            onClick={handlePayWithBalance} 
            disabled={!canPayWithBalance || isProcessing}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-green-500/80 text-white font-bold disabled:bg-gray-600 disabled:opacity-50 transition-all"
          >
            <HiOutlineCurrencyDollar className="w-6 h-6" />
            <span>Pagar con Saldo</span>
          </button>
          <button 
            onClick={handlePayWithCrypto} 
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-blue-500/80 text-white font-bold disabled:bg-gray-600 disabled:opacity-50 transition-all"
          >
            <HiOutlineCreditCard className="w-6 h-6" />
            <span>Pagar con Criptomoneda</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
export default PurchaseFlowModal;