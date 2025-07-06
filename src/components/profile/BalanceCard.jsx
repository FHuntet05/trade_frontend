// frontend/src/components/profile/BalanceCard.jsx
import React from 'react';

const BalanceCard = ({ currency, balance, isUsdt = false }) => (
  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 flex-1 border border-white/10">
    <p className="text-sm text-gray-400">{currency}</p>
    <p className="text-3xl font-bold text-white mt-1">
      {balance.toFixed(isUsdt ? 2 : 4)}
    </p>
  </div>
);
export default BalanceCard;