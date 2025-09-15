// RUTA: frontend/src/pages/admin/AdminTransactionsPage.jsx (VERSIÓN "NEXUS SYNC")

import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '@/pages/admin/api/adminApi';
import toast from 'react-hot-toast';
import { useDebounce } from 'use-debounce';

import TransactionsTable from '@/pages/admin/components/TransactionsTable';
import Loader from '@/components/common/Loader';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2'; // Corregido de HiOutlineSearch a HiOutlineMagnifyingGlass para consistencia

const transactionTypes = [
  { value: '', label: 'Todos los tipos' },
  { value: 'deposit', label: 'Depósito' },
  { value: 'withdrawal', label: 'Retiro' },
  { value: 'purchase', label: 'Compra' },
  { value: 'swap_ntx_to_usdt', label: 'Swap' },
  { value: 'mining_claim', label: 'Reclamo' },
  { value: 'referral_commission', label: 'Comisión' },
  { value: 'task_reward', label: 'Recompensa' },
  { value: 'admin_credit', label: 'Crédito Admin'},
  { value: 'admin_debit', label: 'Débito Admin'},
];

const AdminTransactionsPage = () => {
  const [data, setData] = useState({ transactions: [], page: 1, pages: 1, totalTransactions: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const fetchTransactions = useCallback(async (pageToFetch) => {
    setIsLoading(true);
    try {
      const params = { 
        page: pageToFetch, 
        search: debouncedSearchTerm, 
        type: selectedType 
      };
      // No enviar parámetros vacíos a la API
      if (!params.search) delete params.search;
      if (!params.type) delete params.type;

      // [NEXUS SYNC - VALIDATED] La llamada a /admin/transactions ahora es funcional gracias a los cambios en el backend.
      const { data: responseData } = await adminApi.get('/admin/transactions', { params });
      setData(responseData);
      setCurrentPage(responseData.page);

    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudieron cargar las transacciones.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, selectedType]);

  useEffect(() => {
    // Inicia la carga cuando cambian los filtros
    fetchTransactions(1);
  }, [debouncedSearchTerm, selectedType, fetchTransactions]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= data.pages) {
      setCurrentPage(newPage);
      fetchTransactions(newPage);
    }
  };

  return (
    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Historial de Transacciones</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-dark-primary border border-white/10 text-white text-sm rounded-lg focus:ring-accent-start focus:border-accent-start block w-full md:w-48 p-2.5"
          >
            {transactionTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <div className="relative w-full md:w-64">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input 
              type="text"
              placeholder="Buscar por usuario o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-primary text-white rounded-lg border border-white/10 focus:border-accent-start focus:outline-none"
            />
          </div>
        </div>
      </div>
      
      {isLoading ? (
          <div className="flex justify-center items-center h-96"><Loader text="Cargando transacciones..." /></div>
      ) : (
          <>
              <div className="mb-4 text-sm text-text-secondary">
                  Mostrando {data.transactions.length} de {data.totalTransactions.toLocaleString('es-ES')} transacciones
              </div>
              <TransactionsTable transactions={data.transactions} />
              {data.pages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-text-secondary">Página {currentPage} de {data.pages}</span>
                    <div className="flex gap-2">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} className="px-4 py-2 text-sm font-medium bg-dark-tertiary rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Anterior</button>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= data.pages} className="px-4 py-2 text-sm font-medium bg-dark-tertiary rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Siguiente</button>
                    </div>
                </div>
              )}
              {data.transactions.length === 0 && !isLoading && (
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