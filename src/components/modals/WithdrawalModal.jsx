// frontend/src/components/modals/WithdrawalModal.jsx (VERSIÓN FINAL CON SELECT PERSONALIZADO)

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiXMark, HiShieldCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useUserStore from '../../store/userStore';
import api from '../../api/axiosConfig';

// Importamos el nuevo componente de Select personalizado
import CustomSelect from '../ui/CustomSelect';

const WithdrawalModal = ({ onClose }) => {
  const { user, updateUser } = useUserStore();
  const userBalance = user?.balance?.usdt || 0;

  // Estados para los campos del formulario
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState(''); // Inicialmente vacío
  const [walletAddress, setWalletAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Opciones para nuestro CustomSelect, definidas aquí para mayor claridad
  const networkOptions = [
    { value: 'USDT-TRC20', label: 'USDT (TRC20)' },
    { value: 'USDT-BEP20', label: 'USDT (BEP20)' },
    { value: 'TRX', label: 'Tron (TRX)' },
    { value: 'BNB', label: 'BNB (BEP20)' },
  ];

  const handleMaxClick = () => {
    setAmount(userBalance.toFixed(8));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones de entrada
    if (!amount || !network || !walletAddress) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 1) {
      toast.error('La cantidad mínima para retirar es 1 USDT.');
      return;
    }
    if (numericAmount > userBalance) {
      toast.error('No puedes retirar más de tu saldo disponible.');
      return;
    }

    // Validación de formato de dirección de billetera con Regex
    const addressRegex = {
      'TRX': /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
      'BNB': /^0x[a-fA-F0-9]{40}$/
    };

    let isValidAddress = false;
    if (network === 'USDT-TRC20' || network === 'TRX') {
      isValidAddress = addressRegex.TRX.test(walletAddress);
    } else if (network === 'USDT-BEP20' || network === 'BNB') {
      isValidAddress = addressRegex.BNB.test(walletAddress);
    }

    if (!isValidAddress) {
      toast.error(`La dirección de billetera no tiene un formato válido para la red ${network}.`);
      return;
    }
    
    // Envío de la solicitud
    setIsProcessing(true);
    const withdrawalPromise = api.post('/wallet/request-withdrawal', {
      amount: numericAmount,
      network,
      walletAddress,
    });

    toast.promise(withdrawalPromise, {
      loading: 'Enviando solicitud de retiro...',
      success: (res) => {
        updateUser(res.data.user);
        onClose();
        return res.data.message;
      },
      error: (err) => {
        return err.response?.data?.message || 'Error al enviar la solicitud.';
      },
    }).finally(() => {
      setIsProcessing(false);
    });
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
        
        <h2 className="text-xl font-bold text-center mb-4">Solicitar Retiro</h2>
        <p className="text-sm text-center text-text-secondary mb-6">Saldo disponible: <span className="font-semibold text-white">{userBalance.toFixed(2)} USDT</span></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Cantidad (USDT)</label>
            <div className="flex items-center bg-dark-primary/50 rounded-lg">
              <input
                type="number"
                step="0.01"
                placeholder="Mínimo 1.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent p-3 focus:outline-none"
              />
              <button type="button" onClick={handleMaxClick} className="font-bold text-accent-start pr-4 hover:opacity-80">
                MAX
              </button>
            </div>
          </div>

          {/* REEMPLAZO DEL SELECT NATIVO POR EL COMPONENTE PERSONALIZADO */}
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Red de Retiro</label>
            <CustomSelect 
              value={network}
              onValueChange={setNetwork}
              placeholder="Selecciona una red..."
              options={networkOptions}
            />
          </div>

          <div>
            <label className="text-sm text-text-secondary mb-1 block">Dirección de tu Billetera</label>
            <input
              type="text"
              placeholder="Pega tu dirección aquí"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full bg-dark-primary/50 p-3 rounded-lg focus:outline-none border-2 border-transparent focus:border-accent-start"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full mt-4 py-3 bg-gradient-to-r from-accent-start to-accent-end text-white font-bold rounded-full shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-transform"
          >
            {isProcessing ? 'Procesando...' : 'Confirmar Solicitud'}
          </button>
        </form>
        <div className="flex items-start gap-2 text-xs text-text-secondary mt-4">
            <HiShieldCheck className="w-8 h-8 text-green-400 flex-shrink-0"/>
            <p>Por tu seguridad, las solicitudes de retiro son revisadas y procesadas manualmente. Esto puede tomar algunas horas.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default WithdrawalModal;