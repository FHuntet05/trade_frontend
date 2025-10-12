import React from 'react';
import { motion } from 'framer-motion';

function InvestmentCard({ crypto, onInvest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-4 flex flex-col"
    >
      <div className="flex items-center mb-4">
        <img 
          src={crypto.icon} 
          alt={crypto.name}
          className="w-12 h-12 rounded-full"
        />
        <div className="ml-4">
          <h3 className="text-xl font-bold text-gray-900">{crypto.name}</h3>
          <p className="text-sm text-gray-500">{crypto.symbol}</p>
        </div>
      </div>

      <div className="flex-grow">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500">Mínimo</p>
            <p className="text-lg font-semibold">{crypto.minInvestment} USDT</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500">Máximo</p>
            <p className="text-lg font-semibold">{crypto.maxInvestment} USDT</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-600">Ganancia Diaria</p>
            <p className="text-lg font-semibold text-blue-700">
              {crypto.profitRange.min}% - {crypto.profitRange.max}%
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => onInvest(crypto)}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
      >
        Invertir
      </button>
    </motion.div>
  );
}

export default InvestmentCard;