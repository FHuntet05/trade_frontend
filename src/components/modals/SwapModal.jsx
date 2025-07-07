// frontend/src/components/modals/SwapModal.jsx

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiXMark, HiOutlineArrowsRightLeft } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useUserStore from '../../store/userStore';
import api from '../../api/axiosConfig';
import Loader from '../common/Loader';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { y: "100vh", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 150, damping: 25 } },
  exit: { y: "100vh", opacity: 0, transition: { duration: 0.3 } },
};

const SwapModal = ({ onClose }) => {
  const { user, updateUser } = useUserStore();
  const [ntxAmount, setNtxAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const SWAP_RATE = 10000; // 10,000 NTX = 1 USDT
  const MINIMUM_NTX_SWAP = 1.5 * SWAP_RATE; // 15,000 NTX

  const usdtToReceive = ntxAmount ? parseFloat(ntxAmount) / SWAP_RATE : 0;
  const numericNtxAmount = parseFloat(ntxAmount) || 0;

  const { isValid, errorMessage } = useMemo(() => {
    if (numericNtxAmount <= 0) return { isValid: false, errorMessage: null };
    if (numericNtxAmount > user.balance.ntx) return { isValid: false, errorMessage: 'Saldo NTX insuficiente.' };
    if (numericNtxAmount < MINIMUM_NTX_SWAP) return { isValid: false, errorMessage: `El mínimo para intercambiar es ${MINIMUM_NTX_SWAP.toLocaleString()} NTX.` };
    return { isValid: true, errorMessage: null };
  }, [numericNtxAmount, user.balance.ntx]);

  const handleSwap = async () => {
    if (!isValid) {
      toast.error(errorMessage || 'Cantidad inválida.');
      return;
    }
    setIsLoading(true);
    toast.loading('Procesando intercambio...', { id: 'swap' });
    try {
      const response = await api.post('/wallet/swap', { ntxAmount: numericNtxAmount });
      updateUser(response.data.user);
      toast.success(response.data.message, { id: 'swap' });
      onClose();
    } catch (error) {
      const serverError = error.response?.data?.message || 'Error al procesar el intercambio.';
      toast.error(serverError, { id: 'swap' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="relative bg-gradient-to-br from-dark-primary to-dark-secondary rounded-2xl border border-white/10 w-full max-w-md p-6 text-white"
        variants={modalVariants}
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
          {/* Input de NTX */}
          <div className="bg-black/20 p-3 rounded-lg">
            <div className="flex justify-between items-baseline mb-1">
              <label htmlFor="ntxAmount" className="text-sm text-text-secondary">Pagar con NTX</label>
              <span className="text-xs text-text-secondary">Saldo: {user.balance.ntx.toLocaleString('en-US', {maximumFractionDigits: 2})}</span>
            </div>
            <div className="flex items-center">
              <input
                id="ntxAmount"
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

          {/* Output de USDT */}
          <div className="bg-black/20 p-3 rounded-lg">
            <label className="text-sm text-text-secondary">Recibir USDT</label>
            <p className="text-2xl font-bold text-green-400">{usdtToReceive.toFixed(4)} USDT</p>
          </div>

          {errorMessage && <p className="text-red-400 text-sm text-center">{errorMessage}</p>}
          
          <div className="text-center text-xs text-text-secondary">
            Tasa: {SWAP_RATE.toLocaleString()} NTX = 1 USDT
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