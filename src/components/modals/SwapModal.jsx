// frontend/src/components/modals/SwapModal.jsx (VERSIÓN DE PRODUCCIÓN - LIMPIA Y DINÁMICA)

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiXMark, HiOutlineArrowsRightLeft } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useUserStore from '../../store/userStore';
import api from '../../api/axiosConfig';
import Loader from '../common/Loader';

const SwapModal = ({ onClose }) => {
  const { user, settings, updateUser } = useUserStore();
  const [ntxAmount, setNtxAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Valores de negocio
  const SWAP_RATE = 10000;
  const userNtxBalance = user?.balance?.ntx ?? 0;
  
  // Valores desde la configuración global, con valores por defecto seguros
  const minSwap = settings?.minimumSwap || 10000;
  const swapFee = settings?.swapFeePercent || 0;

  const numericNtxAmount = parseFloat(ntxAmount) || 0;

  const { usdtToReceive, feeAmount, isValid, errorMessage } = useMemo(() => {
    if (numericNtxAmount <= 0) return { usdtToReceive: 0, feeAmount: 0, isValid: false, errorMessage: null };
    
    const fee = numericNtxAmount * (swapFee / 100);
    const amountAfterFee = numericNtxAmount - fee;
    const usdt = amountAfterFee / SWAP_RATE;

    if (numericNtxAmount > userNtxBalance) {
      return { usdtToReceive: usdt, feeAmount: fee, isValid: false, errorMessage: 'Saldo NTX insuficiente.' };
    }
    if (numericNtxAmount < minSwap) {
      return { usdtToReceive: usdt, feeAmount: fee, isValid: false, errorMessage: `El mínimo para intercambiar es ${minSwap.toLocaleString()} NTX.` };
    }
    
    return { usdtToReceive: usdt, feeAmount: fee, isValid: true, errorMessage: null };
  }, [numericNtxAmount, userNtxBalance, minSwap, swapFee, SWAP_RATE]);

  const handleSwap = async () => {
    if (!isValid) {
      toast.error(errorMessage || 'Por favor, introduce una cantidad válida.');
      return;
    }
    setIsLoading(true);
    const swapPromise = api.post('/wallet/swap', { ntxAmount: numericNtxAmount });

    toast.promise(swapPromise, {
      loading: 'Procesando intercambio...',
      success: (res) => {
        updateUser(res.data.user);
        onClose();
        return res.data.message || '¡Intercambio exitoso!';
      },
      error: (err) => err.response?.data?.message || 'Error al procesar el intercambio.',
    }).finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      initial="hidden" animate="visible" exit="hidden" onClick={onClose}
    >
      <motion.div
        className="relative bg-gradient-to-br from-dark-primary to-dark-secondary rounded-2xl border border-white/10 w-full max-w-md p-6 text-white"
        initial={{ y: "50px", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "50px", opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl z-10"><Loader text="Procesando..." /></div>}
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Intercambiar NTX a USDT</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-black/20 p-3 rounded-lg">
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-sm text-text-secondary">Pagar con NTX</label>
              <span className="text-xs text-text-secondary">Saldo: {userNtxBalance.toLocaleString('en-US', {maximumFractionDigits: 2})}</span>
            </div>
            <div className="flex items-center">
              <input
                type="number"
                placeholder="0.00"
                value={ntxAmount}
                onChange={(e) => setNtxAmount(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold focus:outline-none"
                disabled={isLoading}
              />
              <span className="text-xl font-bold text-accent-end ml-2">NTX</span>
            </div>
          </div>

          <div className="flex justify-center my-2">
            <HiOutlineArrowsRightLeft className="w-6 h-6 text-text-secondary rotate-90" />
          </div>

          <div className="bg-black/20 p-3 rounded-lg">
            <label className="text-sm text-text-secondary">Recibir USDT</label>
            <p className="text-2xl font-bold text-green-400">{usdtToReceive.toFixed(4)} USDT</p>
          </div>

          {errorMessage && <p className="text-red-400 text-sm text-center">{errorMessage}</p>}
          
          <div className="text-xs space-y-1 bg-black/10 p-2 rounded-lg text-center text-text-secondary">
             <p>Tasa de cambio: {SWAP_RATE.toLocaleString()} NTX = 1 USDT</p>
             {swapFee > 0 && <p>Comisión de Intercambio: {swapFee}% ({feeAmount.toLocaleString()} NTX)</p>}
          </div>

          <button
            onClick={handleSwap}
            disabled={!isValid || isLoading}
            className="w-full py-3 bg-gradient-to-r from-accent-start to-accent-end text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Confirmar Intercambio
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SwapModal;