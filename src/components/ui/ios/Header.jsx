// RUTA: src/components/ui/ios/Header.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { triggerImpactHaptic } from '@/utils/haptics';
import { formatters } from '@/utils/formatters';

export const IOSHeader = ({ balance, onDeposit }) => {
  const handleAction = (action) => {
    triggerImpactHaptic('light');
    if (action) {
      action();
    }
  };

  return (
    <div className="bg-system-background pt-safe-top sticky top-0 z-10 border-b border-gray-200/80">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-secondary text-sm font-ios">Saldo Total</p>
            <h1 className="text-3xl font-ios-display font-bold text-text-primary tracking-tight">
              {formatters.formatCurrency(balance)} <span className="text-2xl font-normal text-text-tertiary">USDT</span>
            </h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAction(onDeposit)}
            className="bg-ios-green text-white px-5 py-2.5 rounded-ios-button font-ios font-semibold text-sm shadow-ios-button"
          >
            Depósito
          </motion.button>
        </div>
      </div>
    </div>
  );
};