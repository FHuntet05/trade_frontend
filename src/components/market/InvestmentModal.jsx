import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

function InvestmentModal({ isOpen, onClose, crypto, userBalance, onInvest }) {
  const [amount, setAmount] = useState(crypto?.minInvestment || 0);
  const [estimatedProfit, setEstimatedProfit] = useState(0);

  useEffect(() => {
    if (crypto) {
      setAmount(crypto.minInvestment);
    }
  }, [crypto]);

  useEffect(() => {
    if (crypto && amount) {
      const profitPercentage = (
        Math.random() * (crypto.profitRange.max - crypto.profitRange.min) + 
        crypto.profitRange.min
      );
      setEstimatedProfit((amount * profitPercentage) / 100);
    }
  }, [amount, crypto]);

  const handleAmountChange = (e) => {
    const value = Number(e.target.value);
    setAmount(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onInvest({
      symbol: crypto.symbol,
      amount: Number(amount)
    });
  };

  if (!crypto) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <img 
                src={crypto.icon} 
                alt={crypto.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-3">
                <Dialog.Title className="text-xl font-bold">
                  Invertir en {crypto.name}
                </Dialog.Title>
                <p className="text-sm text-gray-500">{crypto.symbol}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Monto a Invertir (USDT)
              </label>
              <div className="mt-1 relative">
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  min={crypto.minInvestment}
                  max={Math.min(crypto.maxInvestment, userBalance)}
                  step="1"
                  className="block w-full border border-gray-300 rounded-lg shadow-sm px-4 py-3 text-lg"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500">USDT</span>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Balance disponible: {userBalance.toFixed(2)} USDT
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Detalles de la Inversión
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">Ganancia Diaria</span>
                  <span className="font-semibold text-blue-800">
                    {estimatedProfit.toFixed(2)} USDT ({(estimatedProfit / amount * 100).toFixed(2)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">Duración</span>
                  <span className="font-semibold text-blue-800">24 horas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">Total a Recibir</span>
                  <span className="font-semibold text-blue-800">
                    {(amount + estimatedProfit).toFixed(2)} USDT
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={amount < crypto.minInvestment || amount > Math.min(crypto.maxInvestment, userBalance)}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-colors ${
                  amount < crypto.minInvestment || amount > Math.min(crypto.maxInvestment, userBalance)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                Confirmar Inversión
              </button>
              {amount < crypto.minInvestment && (
                <p className="mt-2 text-sm text-red-600 text-center">
                  El monto mínimo es {crypto.minInvestment} USDT
                </p>
              )}
              {amount > crypto.maxInvestment && (
                <p className="mt-2 text-sm text-red-600 text-center">
                  El monto máximo es {crypto.maxInvestment} USDT
                </p>
              )}
              {amount > userBalance && (
                <p className="mt-2 text-sm text-red-600 text-center">
                  Saldo insuficiente
                </p>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </Dialog>
  );
}

export default InvestmentModal;