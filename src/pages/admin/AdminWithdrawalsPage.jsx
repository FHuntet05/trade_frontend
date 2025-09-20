// RUTA: frontend/src/pages/admin/AdminWithdrawalsPage.jsx (VERSIÓN "NEXUS - DATA INTEGRITY FIX")
import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '@/pages/admin/api/adminApi';
import toast from 'react-hot-toast';
import Loader from '@/components/common/Loader';
import Pagination from '@/components/common/Pagination';
import { HiOutlineClipboardDocument, HiOutlineClipboardDocumentCheck, HiOutlineReceiptRefund } from 'react-icons/hi2';

// Sub-componente para la celda de montos, ahora "blindado" contra datos nulos.
const AmountCell = ({ withdrawal }) => {
  const { grossAmount, feeAmount, netAmount } = withdrawal;
  
  // [NEXUS DATA INTEGRITY FIX] - INICIO DE LA CORRECCIÓN CRÍTICA
  // Se utiliza '(valor || 0).toFixed(2)' para asegurar que siempre se opera sobre un número.
  // Esto previene el crash si la API envía un valor nulo o indefinido.
  const formattedNetAmount = (netAmount || 0).toFixed(2);
  const formattedGrossAmount = (grossAmount || 0).toFixed(2);
  const formattedFeeAmount = (feeAmount || 0).toFixed(2);
  // [NEXUS DATA INTEGRITY FIX] - FIN DE LA CORRECCIÓN CRÍTICA

  return (
    <div className="font-mono">
      <p className="font-bold text-lg text-green-400">{formattedNetAmount}</p>
      <p className="text-xs text-text-secondary mt-1">Solicitado: {formattedGrossAmount}</p>
      <p className="text-xs text-text-secondary">Comisión: -{formattedFeeAmount}</p>
    </div>
  );
};

// Componente para la tabla, ahora más limpio y reutilizable.
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
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
          <tr>
            <th className="p-3">Usuario</th>
            <th className="p-3">Monto a Pagar (USDT)</th>
            <th className="p-3">Dirección de Retiro</th>
            <th className="p-3">Fecha</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {withdrawals.map((tx) => (
            <tr key={tx._id} className="hover:bg-dark-tertiary">
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <img className="w-8 h-8 rounded-full bg-dark-primary object-cover" src={tx.user?.photoUrl} alt="avatar" />
                  <span>{tx.user?.username}</span>
                </div>
              </td>
              <td className="p-3"><AmountCell withdrawal={tx} /></td>
              <td className="p-3 font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-xs">{tx.walletAddress}</span>
                  <button onClick={() => handleCopy(tx.walletAddress)} className="text-gray-400 hover:text-white">
                    {copiedAddress === tx.walletAddress ? <HiOutlineClipboardDocumentCheck className="w-5 h-5 text-green-400" /> : <HiOutlineClipboardDocument className="w-5 h-5" />}
                  </button>
                </div>
              </td>
              <td className="p-3 text-sm text-text-secondary whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
              <td className="p-3 text-center">
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
  const [data, setData] = useState({ withdrawals: [], page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchWithdrawals = useCallback(async (pageToFetch = 1) => {
    setIsLoading(true);
    try {
      const { data: responseData } = await adminApi.get('/admin/withdrawals', { params: { page: pageToFetch } });
      setData(responseData);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al cargar las solicitudes.");
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
      notes = window.prompt("Introduce el motivo del rechazo (los fondos serán devueltos):");
      if (notes === null) {
        setProcessingId(null);
        return;
      }
    } else if (status === 'completed') {
      if (!window.confirm("CONFIRMACIÓN: ¿Ya ha enviado los fondos manualmente? Esta acción es irreversible.")) {
        setProcessingId(null);
        return;
      }
    }
    
    const promise = adminApi.put(`/admin/withdrawals/${txId}/process`, { status, adminNotes: notes });

    toast.promise(promise, {
        loading: 'Procesando solicitud...',
        success: (res) => {
            fetchWithdrawals(data.page);
            return res.data.message || `Retiro procesado.`;
        },
        error: (err) => err.response?.data?.message || 'No se pudo procesar el retiro.'
    });

    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
        <h1 className="text-2xl font-semibold mb-1 flex items-center gap-3"><HiOutlineReceiptRefund /> Retiros Pendientes</h1>
        <p className="text-text-secondary">Aprueba o rechaza las solicitudes de retiro de los usuarios.</p>
      </div>

      <div className="bg-dark-secondary rounded-lg border border-white/10 p-4">
        {isLoading ? <div className="flex justify-center items-center h-96"><Loader text="Cargando solicitudes..." /></div>
        : data.withdrawals.length > 0 ? (
            <>
              <WithdrawalsTable withdrawals={data.withdrawals} onProcess={handleProcessWithdrawal} processingId={processingId} />
              <Pagination currentPage={data.page} totalPages={data.pages} onPageChange={fetchWithdrawals} />
            </>
          )
        : (
            <div className="text-center py-16 text-text-secondary">
              <p>¡Excelente! No hay solicitudes de retiro pendientes.</p>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default AdminWithdrawalsPage;