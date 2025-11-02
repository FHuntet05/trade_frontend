// RUTA: frontend/src/components/profile/WithdrawalComponent.jsx

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/userStore';
import { IOSButton } from '../ui/IOSComponents';
import { FiX } from 'react-icons/fi';
import { formatters } from '@/utils/formatters';

const WithdrawalComponent = ({ isVisible, onClose }) => {
  const { user, settings } = useUserStore();
  const [withdrawalPassword, setWithdrawalPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const { t } = useTranslation();

  const withdrawableBalance = user?.withdrawableBalance || 0;
  const minimumWithdrawal = settings?.minimumWithdrawal || 10;

  const isWithdrawalDisabled = useMemo(() => {
    return withdrawableBalance < minimumWithdrawal;
  }, [withdrawableBalance, minimumWithdrawal]);

  const helperText = useMemo(() => {
    if (withdrawableBalance < minimumWithdrawal) {
      return t('withdrawalModal.helperInsufficient', {
        minimum: formatters.formatCurrency(minimumWithdrawal),
      });
    }
    return t('withdrawalModal.helperAvailable', {
      amount: formatters.formatCurrency(withdrawableBalance),
    });
  }, [minimumWithdrawal, t, withdrawableBalance]);

  const handleConfirmWithdrawal = () => {
    console.log({ withdrawalPassword, walletAddress, amount });
    // Aquí iría la lógica de validación y llamada a la API de retiro.
    onClose();
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
        // --- INICIO DE LA CORRECCIÓN CRÍTICA (Z-INDEX) ---
        // Se incrementa el z-index de z-50 a z-60.
        // Esto asegura que el contenedor del modal (fondo oscuro y el propio modal)
        // se renderice en una capa superior a la barra de navegación inferior (que tiene z-50).
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-end justify-center z-60"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose} // Permite cerrar el modal al hacer clic en el fondo
        >
          <motion.div
            className="w-full max-w-lg bg-system-background rounded-t-ios-2xl p-4 flex flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal se propague al fondo
          >
            {/* --- FIN DE LA CORRECCIÓN CRÍTICA --- */}

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
                  className="w-full p-3 bg-internal-card border border-gray-300 rounded-ios focus:outline-none focus:ring-2 focus:ring-ios-green"
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
                  className="w-full p-3 bg-internal-card border border-gray-300 rounded-ios focus:outline-none focus:ring-2 focus:ring-ios-green"
                />
              </div>
              <div>
                <label className="font-ios text-sm text-text-secondary ml-1 mb-1 block">
                  {t('withdrawalModal.amountLabel')}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-3 bg-internal-card border border-gray-300 rounded-ios focus:outline-none focus:ring-2 focus:ring-ios-green"
                />
                <p className={`font-ios text-xs mt-2 ml-1 ${isWithdrawalDisabled ? 'text-red-500' : 'text-text-tertiary'}`}>
                  {helperText}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <IOSButton
                onClick={handleConfirmWithdrawal}
                disabled={isWithdrawalDisabled || !withdrawalPassword || !walletAddress || !amount || parseFloat(amount) <= 0}
                variant="primary"
                className="w-full"
              >
                {t('withdrawalModal.confirmButton')}
              </IOSButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WithdrawalComponent;