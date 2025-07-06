// src/components/tools/PaymentMethodModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiXMark, HiOutlineCreditCard, HiOutlineCurrencyDollar } from 'react-icons/hi2';
import useUserStore from '../../store/userStore';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';

// Este modal recibe el 'tool' y dos funciones 'onClose' y 'onCryptoPay'
const PaymentMethodModal = ({ tool, onClose, onCryptoPay }) => {
  const { user, updateUser } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const userBalance = user?.balance?.usdt || 0;
  const canPayWithBalance = userBalance >= tool.price;

  // Nueva función para manejar la compra directa con saldo
  const handlePayWithBalance = async () => {
    if (!canPayWithBalance || isProcessing) return;

    setIsProcessing(true);
    const purchasePromise = api.post('/tools/purchase-with-balance', { toolId: tool._id });

    toast.promise(purchasePromise, {
      loading: 'Procesando pago con saldo...',
      success: (response) => {
        updateUser(response.data.user);
        setTimeout(onClose, 1000); // Cerrar todo al finalizar
        return response.data.message || '¡Compra exitosa!';
      },
      error: (err) => err.response?.data?.message || 'Error al procesar el pago.',
    }).finally(() => setIsProcessing(false));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        className="bg-gray-800 border border-white/10 rounded-2xl w-full max-w-sm text-white p-6 relative"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={onClose}><HiXMark className="w-6 h-6" /></button>
        <h2 className="text-xl font-bold text-center mb-4">Seleccionar Método de Pago</h2>
        <p className="text-center text-gray-400 mb-6">Comprando: <span className="font-bold text-white">{tool.name}</span> por <span className="font-bold text-white">{tool.price.toFixed(2)} USDT</span></p>

        <div className="space-y-4">
          {/* Botón para Pagar con Saldo */}
          <button
            onClick={handlePayWithBalance}
            disabled={!canPayWithBalance || isProcessing}
            className="w-full flex items-center justify-center gap-3 p-4 font-semibold rounded-lg bg-green-500/20 text-green-300 border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500/10 disabled:text-gray-400 disabled:border-gray-500/20 transition-all"
          >
            <HiOutlineCurrencyDollar className="w-6 h-6" />
            <div>
              <p>Pagar con Saldo</p>
              <p className="text-xs font-normal">Disponible: {userBalance.toFixed(2)} USDT</p>
            </div>
          </button>

          {/* Botón para Pagar con Cripto */}
          <button
            onClick={onCryptoPay} // Esta función la pasaremos desde ToolsPage
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-3 p-4 font-semibold rounded-lg bg-primary/20 text-purple-300 border border-primary/30 transition-all"
          >
            <HiOutlineCreditCard className="w-6 h-6" />
            <span>Pagar con Criptomoneda</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentMethodModal;