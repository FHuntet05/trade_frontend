// frontend/src/components/history/TransactionItem.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { 
  HiArrowDownOnSquare, HiArrowUpOnSquare, HiMiniCpuChip, HiShoppingBag, 
  HiArrowsRightLeft, HiUsers, HiTrophy 
} from 'react-icons/hi2';

const transactionDetails = {
  deposit: { icon: HiArrowDownOnSquare, color: 'text-green-400' },
  withdrawal: { icon: HiArrowUpOnSquare, color: 'text-red-400' },
  purchase: { icon: HiShoppingBag, color: 'text-yellow-400' },
  swap_ntx_to_usdt: { icon: HiArrowsRightLeft, color: 'text-cyan-400' },
  mining_claim: { icon: HiMiniCpuChip, color: 'text-purple-400' },
  referral_commission: { icon: HiUsers, color: 'text-pink-400' },
  task_reward: { icon: HiTrophy, color: 'text-orange-400' },
  default: { icon: HiShoppingBag, color: 'text-gray-400' },
};

const TransactionItem = ({ transaction }) => {
  const details = transactionDetails[transaction.type] || transactionDetails.default;
  const Icon = details.icon;
  
  const isPositive = ['deposit', 'mining_claim', 'referral_commission', 'task_reward'].includes(transaction.type);
  const amountSign = isPositive ? '+' : '-';
  const amountColor = isPositive ? 'text-green-400' : 'text-red-400';

  return (
    <motion.div 
      className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10"
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
      }}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full bg-black/20 ${details.color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="font-semibold text-white">{transaction.description}</p>
          <p className="text-xs text-text-secondary">
            {new Date(transaction.createdAt).toLocaleString('es-ES', { 
              day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold text-lg ${amountColor}`}>
          {amountSign} {parseFloat(transaction.amount).toFixed(2)}
        </p>
        <p className="text-xs text-text-secondary">{transaction.currency}</p>
      </div>
    </motion.div>
  );
};

export default TransactionItem;