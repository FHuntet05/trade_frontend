// frontend/src/pages/admin/components/TransactionsTable.jsx (COMPLETO)

import React from 'react';

const TransactionsTable = ({ transactions }) => {

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'medium' });
  };

  const formatType = (type) => {
    const typeMap = {
      deposit: { text: 'Depósito', color: 'bg-green-500/20 text-green-400' },
      withdrawal: { text: 'Retiro', color: 'bg-yellow-500/20 text-yellow-400' },
      purchase: { text: 'Compra', color: 'bg-red-500/20 text-red-400' },
      swap_ntx_to_usdt: { text: 'Swap', color: 'bg-blue-500/20 text-blue-400' },
      mining_claim: { text: 'Reclamo', color: 'bg-purple-500/20 text-purple-400' },
      referral_commission: { text: 'Comisión', color: 'bg-teal-500/20 text-teal-400' },
      task_reward: { text: 'Recompensa', color: 'bg-indigo-500/20 text-indigo-400' },
    };
    const { text, color } = typeMap[type] || { text: type, color: 'bg-gray-500/20 text-gray-400' };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>{text}</span>;
  };

  const formatAmount = (amount, currency) => {
    const isPositive = ['deposit', 'mining_claim', 'referral_commission', 'task_reward'].includes(transactions.find(t => t.amount === amount)?.type);
    const color = isPositive ? 'text-green-400' : 'text-red-400';
    const prefix = isPositive ? '+' : '-';
    return <span className={`font-mono ${color}`}>{`${prefix}${amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} ${currency}`}</span>;
  };

  return (
    <div className="overflow-x-auto bg-dark-secondary rounded-lg border border-white/10">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-text-secondary uppercase bg-black/20">
          <tr>
            <th scope="col" className="px-6 py-3">Usuario</th>
            <th scope="col" className="px-6 py-3">Tipo</th>
            <th scope="col" className="px-6 py-3">Monto</th>
            <th scope="col" className="px-6 py-3">Descripción</th>
            <th scope="col" className="px-6 py-3">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id} className="border-b border-dark-primary hover:bg-white/5">
              <td className="px-6 py-4">
                {tx.user ? (
                  <div className="flex items-center gap-3">
                    <img className="w-8 h-8 rounded-full object-cover" src={tx.user.photoUrl || '/assets/images/user-avatar-placeholder.png'} alt={`${tx.user.username} avatar`} />
                    <span>{tx.user.username}</span>
                  </div>
                ) : (
                  <span className="text-text-secondary">Usuario no disponible</span>
                )}
              </td>
              <td className="px-6 py-4">{formatType(tx.type)}</td>
              <td className="px-6 py-4">{formatAmount(tx.amount, tx.currency)}</td>
              <td className="px-6 py-4 text-text-secondary">{tx.description}</td>
              <td className="px-6 py-4 font-mono text-text-secondary">{formatDate(tx.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;