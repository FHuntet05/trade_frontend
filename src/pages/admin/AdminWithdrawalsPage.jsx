// frontend/src/pages/admin/AdminWithdrawalsPage.jsx (COMPLETO Y REFORZADO)
import React, { useState, useEffect, useCallback } from 'react';
import useAdminStore from '../../store/adminStore';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { HiOutlineClipboardDocument, HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';

const WithdrawalsTable = ({ withdrawals, onProcess }) => {
  const [copiedAddress, setCopiedAddress] = useState('');

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    toast.success('Dirección copiada!');
    setTimeout(() => setCopiedAddress(''), 2000);
  };

  return (
    <div className="overflow-x-auto bg-dark-secondary rounded-lg border border-white/10">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-text-secondary uppercase bg-black/20">
          <tr>
            <th className="px-6 py-3">Usuario</th>
            <th className="px-6 py-3">Monto (USDT)</th>
            <th className="px-6 py-3">Dirección de Retiro</th>
            <th className="px-6 py-3">Fecha Solicitud</th>
            <th className="px-6 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map((tx) => (
            <tr key={tx._id} className="border-b border-dark-primary hover:bg-white/5">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img className="w-8 h-8 rounded-full" src={tx.user?.photoUrl || '/assets/images/user-avatar-placeholder.png'} alt="avatar" />
                  <span>{tx.user?.username || 'Usuario no encontrado'}</span>
                </div>
              </td>
              <td className="px-6 py-4 font-mono">{tx.amount.toFixed(2)}</td>
              <td className="px-6 py-4 font-mono text-text-secondary">
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-xs">{tx.metadata?.get('withdrawalAddress')}</span>
                  <button onClick={() => handleCopy(tx.metadata?.get('withdrawalAddress'))} className="text-gray-400 hover:text-white">
                    {copiedAddress === tx.metadata?.get('withdrawalAddress') ? <HiOutlineClipboardDocumentCheck className="w-5 h-5 text-green-400" /> : <HiOutlineClipboardDocument className="w-5 h-5" />}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4">{new Date(tx.createdAt).toLocaleString('es-ES')}</td>
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center gap-2">
                  <button onClick={() => onProcess(tx._id, 'completed')} className="px-3 py-1.5 text-xs font-bold text-green-800 bg-green-400 rounded-md hover:bg-green-300">Aprobar</button>
                  <button onClick={() => onProcess(tx._id, 'rejected')} className="px-3 py-1.5 text-xs font-bold text-red-800 bg-red-400 rounded-md hover:bg-red-300">Rechazar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdminWithdrawalsPage = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { adminInfo } = useAdminStore();

  const fetchWithdrawals = useCallback(async (currentPage, token) => {
    currentPage === 1 ? setIsLoading(true) : setIsLoadingMore(true);
    try {
      const { data } = await api.get(`/api/admin/withdrawals?page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWithdrawals(prev => currentPage === 1 ? data.withdrawals : [...prev, ...data.withdrawals]);
      setHasMore(data.page < data.pages);
      setPage(data.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudieron cargar los retiros.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (adminInfo?.token) {
      fetchWithdrawals(1, adminInfo.token);
    }
  }, [adminInfo, fetchWithdrawals]);

  const loadMore = () => {
    if (adminInfo?.token) {
      fetchWithdrawals(page + 1, adminInfo.token);
    }
  };

  const handleProcessWithdrawal = async (txId, newStatus) => {
    let notes = '';
    if (newStatus === 'rejected') {
      notes = window.prompt("Por favor, introduce el motivo del rechazo:");
      if (notes === null) return;
    } else {
        if (!window.confirm("¿Estás seguro de que quieres aprobar este retiro? Esta acción es irreversible.")) {
            return;
        }
    }
    try {
      await api.put(`/api/admin/withdrawals/${txId}`, 
        { newStatus, adminNotes: notes },
        { headers: { Authorization: `Bearer ${adminInfo.token}` } }
      );
      toast.success(`Retiro procesado como "${newStatus}".`);
      fetchWithdrawals(1, adminInfo.token);
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo procesar el retiro.');
    }
  };

  return (
    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 text-white">
      <h1 className="text-2xl font-semibold mb-4">Solicitudes de Retiro Pendientes</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-96"><Loader text="Cargando solicitudes..." /></div>
      ) : withdrawals.length > 0 ? (
        <>
          <WithdrawalsTable withdrawals={withdrawals} onProcess={handleProcessWithdrawal} />
          {hasMore && (
            <div className="mt-6 text-center">
              <button onClick={loadMore} disabled={isLoadingMore} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                {isLoadingMore ? 'Cargando...' : 'Cargar Más'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-text-secondary">
          <p>¡Buen trabajo! No hay solicitudes de retiro pendientes.</p>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawalsPage;