// frontend/src/pages/admin/AdminTransactionsPage.jsx (COMPLETO CON BÚSQUEDA Y FILTRADO)

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import { useDebounce } from 'use-debounce';

import TransactionsTable from './components/TransactionsTable';
import Loader from '../../components/common/Loader';
import { HiOutlineSearch } from 'react-icons/hi';

const transactionTypes = [
  { value: '', label: 'Todos los tipos' },
  { value: 'deposit', label: 'Depósito' },
  { value: 'withdrawal', label: 'Retiro' },
  { value: 'purchase', label: 'Compra' },
  { value: 'swap_ntx_to_usdt', label: 'Swap' },
  { value: 'mining_claim', label: 'Reclamo' },
  { value: 'referral_commission', label: 'Comisión' },
  { value: 'task_reward', label: 'Recompensa' },
];

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // --- Estados para filtrado y búsqueda ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { 
        page, 
        search: debouncedSearchTerm, 
        type: selectedType 
      };
      // Limpiamos los parámetros que estén vacíos
      if (!params.search) delete params.search;
      if (!params.type) delete params.type;

      const { data } = await api.get('/admin/transactions', { params });
      
      setTransactions(data.transactions);
      setPage(data.page);
      setTotalPages(data.pages);
      setTotalTransactions(data.totalTransactions);
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudieron cargar las transacciones.');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearchTerm, selectedType]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, selectedType]);

  return (
    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Historial de Transacciones</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* --- Filtro por Tipo --- */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-black/20 border border-white/10 text-white text-sm rounded-lg focus:ring-accent-start focus:border-accent-start block w-full md:w-48 p-2.5"
          >
            {transactionTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          {/* --- Barra de Búsqueda por Usuario --- */}
          <div className="relative w-full md:w-64">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input 
              type="text"
              placeholder="Buscar por usuario o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/20 text-white rounded-lg border-2 border-transparent focus:border-accent-start focus:outline-none"
            />
          </div>
        </div>
      </div>
      
      {isLoading ? (
          <div className="flex justify-center items-center h-96"><Loader text="Cargando transacciones..." /></div>
      ) : (
          <>
              <div className="mb-4 text-sm text-text-secondary">
                  Mostrando {transactions.length} de {totalTransactions.toLocaleString('es-ES')} transacciones
              </div>
              <TransactionsTable transactions={transactions} />
              {totalPages > 0 && (
                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-text-secondary">Página {page} de {totalPages}</span>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="px-4 py-2 text-sm font-medium bg-black/20 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Anterior</button>
                        <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="px-4 py-2 text-sm font-medium bg-black/20 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Siguiente</button>
                    </div>
                </div>
              )}
              {transactions.length === 0 && !isLoading && (
                <div className="text-center py-16 text-text-secondary">
                  <p>No se encontraron transacciones que coincidan con los filtros.</p>
                </div>
              )}
          </>
      )}
    </div>
  );
};

export default AdminTransactionsPage;