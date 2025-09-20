// RUTA: frontend/src/components/modals/WithdrawalModal.jsx (VERSIÓN "NEXUS - GLOBAL STYLE SYNC")

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiXMark, HiShieldCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useUserStore from '../../store/userStore';
import api from '../../api/axiosConfig';

const WithdrawalModal = ({ onClose }) => {
  const { user, settings, updateUser } = useUserStore();
  
  const userBalance = user?.balance?.usdt || 0;
  const minWithdrawal = settings?.minimumWithdrawal || 1.0;
  const withdrawalFee = settings?.withdrawalFeePercent || 0;

  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { feeAmount, netAmount } = useMemo(() => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return { feeAmount: 0, netAmount: 0 };
    }
    const fee = numericAmount * (withdrawalFee / 100);
    const net = numericAmount - fee;
    return { feeAmount: fee, netAmount: net };
  }, [amount, withdrawalFee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (!amount || !walletAddress) return toast.error('Todos los campos son obligatorios.');
    if (isNaN(numericAmount) || numericAmount < minWithdrawal) return toast.error(`La cantidad mínima para retirar es ${minWithdrawal} USDT.`);
    if (numericAmount > userBalance) return toast.error('No puedes retirar más de tu saldo disponible.');
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) return toast.error('La dirección de billetera no tiene un formato válido.');
    
    setIsProcessing(true);
    const withdrawalPromise = api.post('/wallet/request-withdrawal', {
      amount: numericAmount,
      walletAddress,
      network: 'USDT-BEP20',
    });

    toast.promise(withdrawalPromise, {
      loading: 'Enviando solicitud...',
      success: (res) => {
        updateUser(res.data.user);
        onClose();
        return res.data.message;
      },
      error: (err) => err.response?.data?.message || 'Error al enviar la solicitud.',
    }).finally(() => setIsProcessing(false));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        className="bg-dark-secondary border border-white/10 rounded-2xl w-full max-w-sm text-white p-6 relative"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      >
        <button className="absolute top-4 right-4 text-text-secondary hover:text-white" onClick={onClose}><HiXMark className="w-6 h-6" /></button>
        <h2 className="text-xl font-bold text-center mb-4">Solicitar Retiro</h2>
        <p className="text-sm text-center text-text-secondary mb-6">Saldo disponible: <span className="font-semibold text-white">{userBalance.toFixed(2)} USDT</span></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Cantidad a Retirar (USDT)</label>
            <div className="flex items-center bg-dark-primary/50 rounded-lg">
              <input type="number" step="0.01" placeholder={`Mínimo ${minWithdrawal}`} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent p-3 focus:outline-none" />
              {/* [NEXUS STYLE SYNC] - Se actualiza el color del texto a 'text-accent' */}
              <button type="button" onClick={() => setAmount(userBalance.toString())} className="font-bold text-accent pr-4">MAX</button>
            </div>
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Dirección de Billetera (BEP20)</label>
            <input type="text" placeholder="Pega tu dirección 0x..." value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="w-full bg-dark-primary/50 p-3 rounded-lg" />
          </div>

          <div className="text-sm space-y-1 bg-black/20 p-3 rounded-lg">
            <div className="flex justify-between text-text-secondary"><span>Comisión ({withdrawalFee}%):</span><span>- {feeAmount.toFixed(4)} USDT</span></div>
            <div className="flex justify-between font-bold"><span>Recibirás:</span><span>{netAmount > 0 ? netAmount.toFixed(4) : '0.0000'} USDT</span></div>
          </div>

          {/* [NEXUS STYLE SYNC] - Se reemplaza el gradiente por el color de acento sólido */}
          <button type="submit" disabled={isProcessing} className="w-full mt-4 py-3 bg-accent text-white font-bold rounded-full disabled:opacity-50">
            {isProcessing ? 'Procesando...' : 'Confirmar Solicitud'}
          </button>
        </form>
        <div className="flex items-start gap-2 text-xs text-text-secondary mt-4">
            <HiShieldCheck className="w-8 h-8 text-green-400 flex-shrink-0"/>
            <p>Las solicitudes de retiro son revisadas manualmente. Esto puede tomar algunas horas. La comisión se aplica sobre el monto retirado.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default WithdrawalModal;