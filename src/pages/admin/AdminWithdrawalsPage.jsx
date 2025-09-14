// frontend/src/pages/admin/AdminWithdrawalsPage.jsx (FASE "REMEDIATIO" - RUTAS CON ALIAS CORREGIDAS)
import React, { useState, useEffect, useCallback } from 'react';
// [REMEDIATIO - SOLUCIÓN ESTRUCTURAL] Se aplican los alias de ruta.
import useAdminStore from '@/store/adminStore';
import adminApi from '@/admin/api/adminApi';
import toast from 'react-hot-toast';
import Loader from '@/components/common/Loader';
import { HiOutlineClipboardDocument, HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';

const WithdrawalsTable = ({ withdrawals, onProcess, processingId }) => {
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
              <td className="px-6 py-4 font-mono">{tx.netAmount.toFixed(2)}</td>
              <td className="px-6 py-4 font-mono text-text-secondary">
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-xs">{tx.walletAddress || 'N/A'}</span>
                  {tx.walletAddress && (
                    <button onClick={() => handleCopy(tx.walletAddress)} className="text-gray-400 hover:text-white">
                      {copiedAddress === tx.walletAddress ? <HiOutlineClipboardDocumentCheck className="w-5 h-5 text-green-400" /> : <HiOutlineClipboardDocument className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">{new Date(tx.createdAt).toLocaleString('es-ES')}</td>
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center gap-2">
                  <button onClick={() => onProcess(tx._id, 'completed')} disabled={!!processingId} className="px-3 py-1.5 text-xs font-bold text-white bg-green-500 rounded-md hover:bg-green-600 disabled:opacity-50">
                    {processingId === tx._id ? 'Procesando...' : 'Aprobar'}
                  </button>
                  <button onClick={() => onProcess(tx._id, 'rejected')} disabled={!!processingId} className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50">
                    Rechazar
                  </button>
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
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchWithdrawals = useCallback(async (targetPage = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await adminApi.get(`/admin/withdrawals?page=${targetPage}`);
      setWithdrawals(data.withdrawals);
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      const errorMessage = `Error al cargar las solicitudes de retiro.`;
      console.error("Error al obtener retiros:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals(1);
  }, [fetchWithdrawals]);

  const handleProcessWithdrawal = async (txId, status) => {
    setProcessingId(txId);
    let notes = '';
    
    if (status === 'rejected') {
      notes = window.prompt("Por favor, introduce el motivo del rechazo (se devolverán los fondos al usuario):");
      if (notes === null) {
        setProcessingId(null);
        return;
      }
    } else if (status === 'completed') {
      if (!window.confirm("¿Estás SEGURO de que quieres APROBAR este retiro? Esta acción es para confirmar que ya has enviado los fondos manualmente. La acción es IRREVERSIBLE.")) {
        setProcessingId(null);
        return;
      }
    }
    
    const processPromise = adminApi.put(`/admin/withdrawals/${txId}/process`, { status, adminNotes: notes });

    try {
        await toast.promise(processPromise, {
            loading: 'Actualizando estado en la base de datos...',
            success: (res) => {
                fetchWithdrawals(page);
                return res.data.message || `Retiro procesado como "${status}".`;
            },
            error: (err) => err.response?.data?.message || 'No se pudo procesar el retiro.'
        });
    } catch (error) {
        console.error("Error al procesar retiro:", error);
    } finally {
        setProcessingId(null);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-96"><Loader text="Cargando solicitudes..." /></div>;
    }
    if (error) {
      return <div className="text-center py-16 text-red-400"><p className="font-mono bg-black/20 p-4 rounded-lg">{error}</p></div>;
    }
    if (withdrawals.length > 0) {
      return (
        <>
          <WithdrawalsTable withdrawals={withdrawals} onProcess={handleProcessWithdrawal} processingId={processingId} />
          {/* Aquí se podría implementar la paginación si se necesita */}
        </>
      );
    }
    return (
      <div className="text-center py-16 text-text-secondary">
        <p>¡Buen trabajo! No hay solicitudes de retiro pendientes.</p>
      </div>
    );
  };

  return (
    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 text-white">
      <h1 className="text-2xl font-semibold mb-4">Solicitudes de Retiro Pendientes</h1>
      {renderContent()}
    </div>
  );
};

export default AdminWithdrawalsPage;