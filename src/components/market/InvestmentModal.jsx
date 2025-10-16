// RUTA: frontend/src/components/market/InvestmentModal.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useMarketStore from '@/store/marketStore'; // Asumimos que la lógica de compra estará aquí
import useUserStore from '@/store/userStore';
import { CryptoIcon } from '@/components/icons/CryptoIcons';
import { formatters } from '@/utils/formatters';
import toast from 'react-hot-toast';
import api from '@/api/axiosConfig';

const InvestmentModal = ({ isOpen, onClose, item, userBalance }) => {
  const { t } = useTranslation();
  const { fetchMarketItems } = useMarketStore();
  const { updateUser } = useUserStore();
  
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setAmount(item.minInvestment);
      setError('');
    }
  }, [item]);
  
  if (!item) return null;

  const estimatedProfit = (amount * item.dailyProfitPercentage) / 100;
  const totalReturn = amount + (estimatedProfit * item.durationDays);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value === '' ? '' : Number(value));
    
    if (Number(value) < item.minInvestment) {
      setError(`El mínimo es ${item.minInvestment} USDT`);
    } else if (Number(value) > item.maxInvestment) {
      setError(`El máximo es ${item.maxInvestment} USDT`);
    } else if (Number(value) > userBalance) {
      setError('Saldo insuficiente');
    } else {
      setError('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (error || isLoading) return;

    setIsLoading(true);
    try {
      const response = await api.post('/investments/purchase', {
        itemId: item._id,
        amount: Number(amount),
      });

      if (response.data.success) {
        toast.success('Compra realizada con éxito!');
        updateUser({ balance: { usdt: response.data.data.newBalance } });
        fetchMarketItems(); // Opcional: para refrescar datos si fuera necesario
        onClose();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al procesar la compra.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative bg-system-background rounded-ios-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <CryptoIcon symbol={item.symbol} className="w-8 h-8 text-text-primary" />
                </div>
                <div>
                  <h3 className="font-ios-display font-bold text-xl text-text-primary">
                    Comprar {item.name}
                  </h3>
                  <p className="font-ios text-text-secondary">
                    Saldo disponible: {formatters.formatCurrency(userBalance)}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-ios text-sm text-text-secondary mb-1 block">
                    Monto (USDT)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder={`Min: ${item.minInvestment}`}
                    className="w-full bg-system-secondary p-3 rounded-ios-button text-text-primary font-ios text-lg focus:outline-none focus:ring-2 focus:ring-ios-green"
                  />
                  {error && <p className="text-red-500 text-xs mt-1 font-ios">{error}</p>}
                </div>

                <div className="bg-system-secondary rounded-ios-card p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-ios text-text-secondary">Ganancia Diaria Estimada</span>
                    <span className="font-ios font-semibold text-ios-green">
                      ~{formatters.formatCurrency(estimatedProfit, 4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-ios text-text-secondary">Retorno Total Estimado</span>
                    <span className="font-ios font-semibold text-text-primary">
                      ~{formatters.formatCurrency(totalReturn)}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading || !!error || amount === ''}
                    className="w-full bg-ios-green text-white py-3.5 rounded-ios-button font-ios font-semibold text-base disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Procesando...' : 'Confirmar Compra'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InvestmentModal;