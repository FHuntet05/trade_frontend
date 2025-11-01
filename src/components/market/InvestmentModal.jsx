// RUTA: frontend/src/components/market/InvestmentModal.jsx
// --- VERSIÓN MEJORADA CON VERIFICACIÓN DE SALDO Y REDIRECCIÓN A DEPÓSITO ---

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useMarketStore from '@/store/marketStore';
import useUserStore from '@/store/userStore';
import { formatters } from '@/utils/formatters';
import toast from 'react-hot-toast';
import api from '@/api/axiosConfig';

const InvestmentModal = ({ isOpen, onClose, item, userBalance }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { fetchMarketItems } = useMarketStore();
  const { updateUser, user } = useUserStore();
  
  const [isLoading, setIsLoading] = useState(false);
  
  if (!item) return null;

  // Calcular métricas del item
  const dailyProfit = item.dailyProfitAmount || 0;
  const saleDiscount = item.saleDiscountPercentage || 0;
  const discountedPriceRaw = saleDiscount > 0
    ? Number(item.price) * (1 - saleDiscount / 100)
    : Number(item.price);
  const discountedPrice = Number(discountedPriceRaw.toFixed(2));
  const totalReturn = discountedPrice + (dailyProfit * item.durationDays);
  const hasSufficientBalance = userBalance >= discountedPrice;
  const missingAmount = discountedPrice - userBalance;
  
  const handlePurchase = async () => {
    // VERIFICACIÓN DE SALDO: Caso crítico
    if (!hasSufficientBalance) {
      toast.error(`Saldo insuficiente. Necesitas ${missingAmount.toFixed(2)} USDT más.`);
      return;
    }

    setIsLoading(true);

    let purchaseData = null;

    try {
      const { data } = await api.post('/investments/purchase', {
        itemId: item._id,
      });

      if (!data?.success) {
        throw new Error(data?.message || 'Error al procesar la compra.');
      }

      purchaseData = data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al procesar la compra.';
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }

    toast.success('¡Compra realizada con éxito!');

    // Actualizar el saldo del usuario en el store
    updateUser({
      balance: {
        ...user.balance,
        usdt: purchaseData.data?.newBalance ?? user.balance?.usdt ?? 0,
      },
    });

    // Refrescar items si es necesario, sin romper el flujo principal si falla
    try {
      await fetchMarketItems();
    } catch (refreshError) {
      console.warn('La compra fue exitosa, pero no se pudo refrescar el mercado.', refreshError);
    }

    onClose();
    setIsLoading(false);
  };

  const handleDepositRedirect = () => {
    onClose();
    // Redirigir a la página de depósito con el monto requerido
    navigate('/deposit/create', { 
      state: { 
        requiredAmount: missingAmount,
        reason: `Compra de ${item.name}`
      } 
    });
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
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-ios-display font-bold text-xl text-text-primary">
                    {item.name}
                  </h3>
                  <p className="font-ios text-text-secondary">
                    Saldo disponible: {formatters.formatCurrency(userBalance)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Información del Item */}
                <div className="bg-system-secondary rounded-ios-card p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-ios text-sm text-text-secondary">Precio</span>
                    {saleDiscount > 0 ? (
                      <span className="font-ios font-bold text-text-primary flex items-center gap-2">
                        <span className="text-sm text-text-tertiary line-through">
                          {formatters.formatCurrency(item.price)}
                        </span>
                        <span className="text-sm text-text-secondary">→</span>
                        <span className="text-text-primary">
                          {formatters.formatCurrency(discountedPrice)}
                        </span>
                      </span>
                    ) : (
                      <span className="font-ios font-bold text-text-primary">
                        {formatters.formatCurrency(discountedPrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="font-ios text-sm text-text-secondary">Ganancia Diaria</span>
                    <span className="font-ios font-semibold text-ios-green">
                      +{formatters.formatCurrency(dailyProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-ios text-sm text-text-secondary">Duración</span>
                    <span className="font-ios font-semibold text-text-primary">
                      {item.durationDays} días
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="font-ios text-sm text-text-secondary">Retorno Total Estimado</span>
                    <span className="font-ios font-bold text-text-primary">
                      {formatters.formatCurrency(totalReturn)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-ios text-sm text-text-secondary">ROI</span>
                    <span className="font-ios font-bold text-ios-green">
                      {item.totalRoiPercentage}%
                    </span>
                  </div>
                </div>

                {/* Mensaje de saldo insuficiente */}
                {!hasSufficientBalance && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-ios-card p-3">
                    <p className="font-ios text-sm text-red-400">
                      ⚠️ Saldo insuficiente. Necesitas {formatters.formatCurrency(missingAmount)} USDT más.
                    </p>
                  </div>
                )}

                {/* Botones de Acción */}
                <div className="pt-2 space-y-2">
                  {hasSufficientBalance ? (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePurchase}
                      disabled={isLoading}
                      className="w-full bg-ios-green text-white py-3.5 rounded-ios-button font-ios font-semibold text-base disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Procesando...' : 'Confirmar Compra'}
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDepositRedirect}
                      className="w-full bg-blue-500 text-white py-3.5 rounded-ios-button font-ios font-semibold text-base"
                    >
                      💰 Depositar Fondos
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="w-full bg-gray-200 text-gray-800 py-3 rounded-ios-button font-ios font-semibold text-base"
                  >
                    Cancelar
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InvestmentModal;