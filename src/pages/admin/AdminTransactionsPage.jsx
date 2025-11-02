// RUTA: frontend/src/pages/admin/AdminTransactionsPage.jsx (VERSIÓN "NEXUS - UI SYNC")

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import adminApi from '@/pages/admin/api/adminApi';
import toast from 'react-hot-toast';
import Loader from '@/components/common/Loader';
import Pagination from '@/components/common/Pagination';
import { HiOutlineReceiptRefund, HiMagnifyingGlass } from 'react-icons/hi2';

// [NEXUS UI SYNC] - INICIO DE LA CORRECCIÓN
// Mapeo de colores y textos para los tipos de transacción. Se actualiza para
// incluir 'commission' y eliminar tipos obsoletos.
const transactionTypeInfo = {
  deposit: { label: 'Depósito', color: 'bg-green-500/20 text-green-300' },
  withdrawal: { label: 'Retiro', color: 'bg-red-500/20 text-red-300' },
  purchase: { label: 'Compra', color: 'bg-blue-500/20 text-blue-300' },
  mining_claim: { label: 'Reclamo Minería', color: 'bg-teal-500/20 text-teal-300' },
  commission: { label: 'Comisión', color: 'bg-purple-500/20 text-purple-300' }, // <-- CORREGIDO Y AÑADIDO
  admin_credit: { label: 'Crédito Admin', color: 'bg-sky-500/20 text-sky-300' },
  admin_debit: { label: 'Débito Admin', color: 'bg-orange-500/20 text-orange-300' },
  swap_ntx_to_usdt: { label: 'Swap NTX > USDT', color: 'bg-cyan-500/20 text-cyan-300' },
  sweep: { label: 'Barrido', color: 'bg-yellow-500/20 text-yellow-300' },
  // 'referral_commission' y 'task_reward' han sido eliminados por ser obsoletos o estar consolidados.
  default: { label: 'Desconocido', color: 'bg-gray-500/20 text-gray-300' }
};
// [NEXUS UI SYNC] - FIN DE LA CORRECCIÓN

const TransactionTypeBadge = ({ type }) => {
  const { label, color } = transactionTypeInfo[type] || transactionTypeInfo.default;
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${color}`}>{label}</span>;
};

const AdminTransactionsPage = () => {
  const [data, setData] = useState({ transactions: [], page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = searchParams.get('page') || 1;
      const search = searchParams.get('search') || '';
      const type = searchParams.get('type') || '';
      
      const params = { 
        page, 
        ...(search && { search }), 
        ...(type && { type }) 
      };

      const { data: responseData } = await adminApi.get('/admin/transactions', { params });
      setData(responseData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al obtener las transacciones.');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (key, value) => {
    setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', '1');
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        return newParams;
    });
  };
  
  const handlePageChange = (newPage) => {
    handleFilterChange('page', newPage.toString());
  };

  return (
    <div className="space-y-6">
        <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
            <h1 className="text-2xl font-semibold mb-1 flex items-center gap-3"><HiOutlineReceiptRefund /> Historial de Transacciones</h1>
            <p className="text-text-secondary">Revisa todas las transacciones financieras que ocurren en la plataforma.</p>
        </div>

        <div className="bg-dark-secondary p-4 rounded-lg border border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:max-w-xs">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input 
                        type="text" 
                        placeholder="Buscar por usuario..." 
                        defaultValue={searchParams.get('search') || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-dark-primary text-black rounded-lg border border-white/10" 
                    />
                </div>
                <select 
                    onChange={(e) => handleFilterChange('type', e.target.value)} 
                    value={searchParams.get('type') || ''} 
                    className="w-full md:w-auto bg-dark-primary p-2 rounded-lg border border-white/10"
                >
                    <option value="">Todos los Tipos</option>
                    {Object.entries(transactionTypeInfo).filter(([key]) => key !== 'default').map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="bg-dark-secondary rounded-lg border border-white/10 overflow-hidden">
            {isLoading ? <div className="h-96 flex items-center justify-center"><Loader text="Cargando transacciones..." /></div> : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
                                <tr>
                                    <th className="p-3">Usuario</th>
                                    <th className="p-3">Tipo</th>
                                    <th className="p-3 text-right">Monto</th>
                                    <th className="p-3">Descripción</th>
                                    <th className="p-3">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {data.transactions.length > 0 ? data.transactions.map((tx) => (
                                    <tr key={tx._id} className="hover:bg-dark-tertiary">
                                        <td className="p-3 font-medium">
                                          {tx.user ? (
                                            <Link to={`/admin/users/${tx.user._id}`} className="hover:text-accent-start">{tx.user.username}</Link>
                                          ) : ( 'Sistema' )}
                                        </td>
                                        <td className="p-3"><TransactionTypeBadge type={tx.type} /></td>
                                        <td className={`p-3 text-right font-mono ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} {tx.currency}
                                        </td>
                                        <td className="p-3 text-sm text-text-secondary">{tx.description}</td>
                                        <td className="p-3 text-sm text-text-secondary whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="text-center p-8 text-text-secondary">No se encontraron transacciones.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination currentPage={data.page} totalPages={data.pages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    </div>
  );
};

export default AdminTransactionsPage;