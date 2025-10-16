import React from 'react';
import { motion } from 'framer-motion';
import { GiftIcon, SupportIcon } from '@/components/icons/AppIcons';
import { triggerImpactHaptic } from '@/utils/haptics';

export const IOSHeader = ({ balance, onDeposit, onClaimBonus, onSupport }) => {
  const handleAction = (action) => {
    triggerImpactHaptic('light');
    action();
  };

  return (
    <div className="bg-dark-primary/95 backdrop-blur-lg">
      {/* Balance Section */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-text-secondary text-sm">Saldo Disponible</p>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl font-bold text-white">
            ${balance.toFixed(2)} <span className="text-lg font-normal">USDT</span>
          </h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAction(onDeposit)}
            className="bg-accent/20 border border-accent/30 backdrop-blur-sm px-5 py-2 rounded-xl text-accent font-semibold text-sm"
          >
            Depósito
          </motion.button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 p-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAction(onClaimBonus)}
          className="flex flex-col items-center gap-2 bg-dark-secondary/50 backdrop-blur-sm p-3 rounded-xl border border-white/5"
        >
          <GiftIcon className="w-6 h-6 text-accent" />
          <span className="text-sm font-medium text-white">Reclamar Bono</span>
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAction(onSupport)}
          className="flex flex-col items-center gap-2 bg-dark-secondary/50 backdrop-blur-sm p-3 rounded-xl border border-white/5"
        >
          <SupportIcon className="w-6 h-6 text-accent" />
          <span className="text-sm font-medium text-white">Soporte</span>
        </motion.button>
      </div>
    </div>
  );
};