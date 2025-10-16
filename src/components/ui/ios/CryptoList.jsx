// RUTA: src/components/ui/ios/CryptoList.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { CryptoIcon } from '@/components/icons/CryptoIcons';
import { formatters } from '@/utils/formatters';

export const CryptoList = ({ cryptos }) => {
  if (!cryptos || cryptos.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-text-tertiary">
        Cargando datos del mercado...
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4">
      {cryptos.map((crypto, index) => (
        <motion.div
          key={crypto.symbol}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-internal-card rounded-ios-card p-4 shadow-ios-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <CryptoIcon symbol={crypto.symbol} className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-ios-display font-semibold text-text-primary">
                  {crypto.name}
                </h3>
                <p className="text-sm text-text-secondary font-ios">
                  {crypto.symbol}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-ios font-medium text-text-primary">
                {formatters.formatCurrency(crypto.price, 6)}
              </p>
              <p className={`text-sm font-ios ${crypto.change >= 0 ? 'text-ios-green' : 'text-red-500'}`}>
                {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};