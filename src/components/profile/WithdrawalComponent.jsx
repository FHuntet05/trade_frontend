// RUTA: frontend/src/components/profile/WithdrawalComponent.jsx

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/userStore';
import { IOSButton } from '../ui/IOSComponents';
import { FiX } from 'react-icons/fi';
import { formatters } from '@/utils/formatters';
import api from '@/api/axiosConfig';
import toast from 'react-hot-toast';

const WithdrawalComponent = ({ isVisible, onClose }) => {
  const { user, settings, refreshUserProfile } = useUserStore();
  const [withdrawalPassword, setWithdrawalPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const withdrawableBalance = user?.withdrawableBalance || 0;
  const minimumWithdrawal = settings?.minimumWithdrawal || 10;
  const withdrawalFeePercent = settings?.withdrawalFeePercent || 0;

  // Pre-cargar la billetera del usuario cuando se abre el modal
  React.useEffect(() => {
    if (isVisible && user?.wallet) {
      setWalletAddress(user.wallet);
    }
  }, [isVisible, user?.wallet]);

  const hasWithdrawalPassword = user?.hasWithdrawalPassword || false;
  const hasWallet = Boolean(user?.wallet);

  // Calcular comisión y monto neto
  const calculatedAmounts = useMemo(() => {
    const grossAmount = parseFloat(amount) || 0;
    const feeAmount = (grossAmount * withdrawalFeePercent) / 100;
    const netAmount = grossAmount - feeAmount;
    return { grossAmount, feeAmount, netAmount };
  }, [amount, withdrawalFeePercent]);

  const isWithdrawalDisabled = useMemo(() => {
    return withdrawableBalance < minimumWithdrawal || !hasWithdrawalPassword || !hasWallet;
  }, [withdrawableBalance, minimumWithdrawal, hasWithdrawalPassword, hasWallet]);

  const helperText = useMemo(() => {
    if (!hasWithdrawalPassword) {
      return t('withdrawalModal.helperNoPassword') || 'Por favor configura tu contraseña de retiro en tu perfil primero.';
    }
    if (!hasWallet) {
      return t('withdrawalModal.helperNoWallet') || 'Por favor configura tu dirección de billetera en tu perfil primero.';
    }
    if (withdrawableBalance < minimumWithdrawal) {
      return t('withdrawalModal.helperInsufficient', {
        minimum: formatters.formatCurrency(minimumWithdrawal),
      });
    }
    return t('withdrawalModal.helperAvailable', {
      amount: formatters.formatCurrency(withdrawableBalance),
    });
  }, [minimumWithdrawal, t, withdrawableBalance, hasWithdrawalPassword, hasWallet]);

  const handleConfirmWithdrawal = async () => {
    if (!withdrawalPassword || !walletAddress || !amount) {
      toast.error('Por favor completa todos los campos.');
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      toast.error('El monto debe ser un número positivo.');
      return;
    }

    if (withdrawalAmount > withdrawableBalance) {
      toast.error('Saldo insuficiente.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/user/withdrawal', {
        amount: withdrawalAmount,
        walletAddress,
        password: withdrawalPassword
      });

      if (response.data.success) {
        const { netAmount } = response.data.transaction;
        toast.success(`Retiro solicitado: recibirás ${formatters.formatCurrency(netAmount)} USDT`);
        
        // Actualizar perfil para reflejar el nuevo saldo
        await refreshUserProfile();
        
        // Limpiar formulario y cerrar modal
        setWithdrawalPassword('');
        setAmount('');
        onClose();
      }
    } catch (error) {
      console.error('[WITHDRAWAL ERROR]', error);
      const errorMessage = error.response?.data?.message || 'Error al procesar el retiro.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalVariants = {
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 500 } },
    hidden: { y: "100vh", opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center pb-24 sm:pb-0 z-[60]"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg bg-system-background rounded-t-ios-2xl sm:rounded-ios-2xl p-4 flex flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex justify-between items-center mb-4">
              <h2 className="font-ios-display text-xl font-bold text-text-primary">
                {t('withdrawalModal.title')}
              </h2>
              <button onClick={onClose} className="p-2">
                <FiX className="w-6 h-6 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-ios text-sm text-text-secondary ml-1 mb-1 block">
                  {t('withdrawalModal.passwordLabel')}
                </label>
                <input
                  type="password"
                  value={withdrawalPassword}
                  onChange={(e) => setWithdrawalPassword(e.target.value)}
                  placeholder={t('withdrawalModal.passwordPlaceholder')}
                  className="w-full p-3 bg-internal-card border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ios-green transition-all"
                />
              </div>
              <div>
                <label className="font-ios text-sm text-text-secondary ml-1 mb-1 block">
                  {t('withdrawalModal.walletLabel')}
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={t('withdrawalModal.walletPlaceholder')}
                  className="w-full p-3 bg-internal-card border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ios-green transition-all"
                />
              </div>
              <div>
                <label className="font-ios text-sm text-text-secondary ml-1 mb-1 block">
                  {t('withdrawalModal.amountLabel')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 p-3 bg-internal-card border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ios-green transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(withdrawableBalance.toString())}
                    className="px-4 py-3 bg-ios-green text-white font-semibold rounded-xl hover:bg-ios-green/90 transition-all"
                  >
                    {t('withdrawalModal.maxButton')}
                  </button>
                </div>
                <p className={`font-ios text-xs mt-2 ml-1 ${isWithdrawalDisabled ? 'text-red-500' : 'text-text-tertiary'}`}>
                  {helperText}
                </p>
              </div>

              {/* Mostrar información de comisión */}
              {calculatedAmounts.grossAmount > 0 && (
                <div className="bg-internal-card rounded-xl p-3 space-y-2 border border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Monto a retirar:</span>
                    <span className="font-semibold text-text-primary">{formatters.formatCurrency(calculatedAmounts.grossAmount)} USDT</span>
                  </div>
                  {withdrawalFeePercent > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Comisión ({withdrawalFeePercent}%):</span>
                      <span className="font-semibold text-orange-500">-{formatters.formatCurrency(calculatedAmounts.feeAmount)} USDT</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-text-secondary font-semibold">Recibirás:</span>
                    <span className="font-bold text-ios-green">{formatters.formatCurrency(calculatedAmounts.netAmount)} USDT</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <IOSButton
                onClick={handleConfirmWithdrawal}
                disabled={isSubmitting || isWithdrawalDisabled || !withdrawalPassword || !walletAddress || !amount || parseFloat(amount) <= 0}
                variant="primary"
                className="w-full"
              >
                {isSubmitting ? 'Procesando...' : t('withdrawalModal.confirmButton')}
              </IOSButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WithdrawalComponent;