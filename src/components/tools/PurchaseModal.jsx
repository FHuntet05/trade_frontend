// RUTA: frontend/src/components/tools/PurchaseModal.jsx (VERSIÓN "NEXUS - CONDICIONAL")
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiXMark, HiOutlineCreditCard, HiOutlineCurrencyDollar, HiMinus, HiPlus } from 'react-icons/hi2';
import useUserStore from '../../store/userStore';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';

// [NEXUS CONDICIONAL]
// El modal ahora necesita tres callbacks para manejar todos los escenarios:
// 1. onClose: para cerrar el modal.
// 2. onPurchaseWithBalance: para ejecutar la compra directa.
// 3. onRedirectToDeposit: para navegar a la página de pago.
const PurchaseModal = ({ tool, onClose, onPurchaseWithBalance, onRedirectToDeposit }) => {
  const { user } = useUserStore(); // Solo necesitamos leer el usuario, no actualizarlo desde aquí.
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const MAX_QUANTITY = 20;

  const handleIncrease = () => {
    if (quantity < MAX_QUANTITY) setQuantity(q => q + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const totalCost = (tool?.price || 0) * quantity;
  const userBalance = user?.balance?.usdt || 0;
  const canPayWithBalance = userBalance >= totalCost;

  // [NEXUS CONDICIONAL] La lógica de la compra con saldo ahora es un callback del padre.
  // Esto mantiene la lógica de API en la página principal, que es una mejor práctica.
  const handlePayWithBalance = async () => {
    setIsProcessing(true);
    // Pasamos el toolId y la quantity para que la página se encargue de la llamada a la API.
    await onPurchaseWithBalance(tool._id, quantity);
    setIsProcessing(false);
  };
  
  // [NEXUS CONDICIONAL] La redirección también es un callback.
  const handleRedirect = () => {
    // Pasamos el costo total para que la página de pago sepa cuánto se necesita.
    onRedirectToDeposit(totalCost); 
  };
  
  // Lógica unificada del botón principal.
  const handlePrimaryAction = () => {
    if (canPayWithBalance) {
      handlePayWithBalance();
    } else {
      handleRedirect();
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

          <div className="flex items-center justify-center my-4 p-3 bg-dark-primary/50 rounded-lg">
            <span className="text-text-secondary mr-4">Cantidad:</span>
            <div className="flex items-center">
                <button onClick={handleDecrease} disabled={quantity <= 1} className="p-2 bg-dark-primary rounded-l-lg disabled:opacity-40 hover:bg-accent-start transition"><HiMinus className="w-5 h-5" /></button>
                <span className="px-4 py-1 bg-dark-primary text-white font-bold text-lg">{quantity}</span>
                <button onClick={handleIncrease} disabled={quantity >= MAX_QUANTITY} className="p-2 bg-dark-primary rounded-r-lg disabled:opacity-40 hover:bg-accent-start transition"><HiPlus className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="space-y-2 text-sm my-4">
            <div className="flex justify-between items-center bg-dark-primary/50 p-3 rounded-lg">
                <span className="text-text-secondary">Costo Total</span>
                <span className="font-bold text-xl text-white">{totalCost.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between items-center bg-dark-primary/50 p-3 rounded-lg">
                <span className="text-text-secondary">Tu Saldo</span>
                <span className={`font-bold text-xl ${canPayWithBalance ? 'text-green-400' : 'text-red-400'}`}>{userBalance.toFixed(2)} USDT</span>
            </div>
          </div>
        
          <div className="mt-6">
            <button 
              onClick={handlePrimaryAction}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-full bg-gradient-to-r from-accent-start to-accent-end text-white font-bold disabled:bg-gray-600 disabled:opacity-50 transition-all"
            >
              {canPayWithBalance ? <HiOutlineCurrencyDollar className="w-6 h-6" /> : <HiOutlineCreditCard className="w-6 h-6" />}
              {/* [NEXUS CONDICIONAL] El texto del botón ahora es dinámico. */}
              <span>{canPayWithBalance ? `Comprar Ahora (${totalCost.toFixed(2)} USDT)` : `Depositar para Comprar`}</span>
            </button>
          </div>
      </motion.div>
    </div>
  );
};
export default PurchaseModal;