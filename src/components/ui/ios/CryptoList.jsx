import React from 'react';
import { motion } from 'framer-motion';
import { CryptoIcon } from '@/components/icons/CryptoIcons';

export const CryptoList = ({ cryptos }) => {
  return (
    <div className="px-4 mt-4">
      <div className="bg-dark-secondary/30 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
        {cryptos.map((crypto, index) => (
          <motion.div
            key={crypto.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              flex items-center justify-between p-4
              ${index !== cryptos.length - 1 ? 'border-b border-white/5' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                <CryptoIcon symbol={crypto.symbol} className="w-6 h-6 text-accent" />
              </div>
              
              <div>
                <h3 className="font-medium text-white">{crypto.name}</h3>
                <p className="text-sm text-text-secondary">{crypto.symbol}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-medium text-white">
                ${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </p>
              <p className={`text-sm ${crypto.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {crypto.change >= 0 ? '+' : ''}{crypto.change}%
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};