// RUTA: frontend/src/pages/admin/AdminWithdrawalsPage.jsx (VERSIÓN CON ENDPOINT CORREGIDO)

import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '@/pages/admin/api/adminApi';
import toast from 'react-hot-toast';
import Loader from '@/components/common/Loader';
import Pagination from '@/components/common/Pagination';
import { HiOutlineClipboardDocument, HiOutlineClipboardDocumentCheck, HiOutlineReceiptRefund } from 'react-icons/hi2';

const AmountCell = ({ withdrawal }) => {
  const { grossAmount, feeAmount, netAmount } = withdrawal;
  const formattedNetAmount = (netAmount || 0).toFixed(2);
  const formattedGrossAmount = (grossAmount || 0).toFixed(2);
  const formattedFeeAmount = (feeAmount || 0).toFixed(2);

  return (
    <div className="font-mono">
      <p className="font-bold text-lg text-green-400">{formattedNetAmount}</p>
      <div className="text-xs text-text-secondary mt-1 space-y-0.5">
          <p>Solicitado: {formattedGrossAmount}</p>
          <p>Comisión: -{formattedFeeAmount}</p>
      </div>
    </div>
  );
};

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
            <th className="p-3">Fecha Solicitud</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {withdrawals.map((tx) => (
            <tr key={tx._id} className="hover:bg-dark-tertiary/50 transition-colors">
              <td className="p-3 align-top">
                <div className="flex items-center gap-3">
                  <img className="w-8 h-8 rounded-full bg-dark-primary object-cover" src={tx.user?.photoUrl} alt="avatar" />
                  <span className="font-medium">{tx.user?.username}</span>
                </div>
              </td>
              <td className="p-3 align-top"><AmountCell withdrawal={tx} /></td>
              <td className="p-3 align-top font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[200px]">{tx.walletAddress}</span>
                  <button onClick={() => handleCopy(tx.walletAddress)} className="text-gray-400 hover:text-white flex-shrink-0">
                    {copiedAddress === tx.walletAddress ? <HiOutlineClipboardDocumentCheck className="w-5 h-5 text-green-400" /> : <HiOutlineClipboardDocument className="w-5 h-5" />}
                  </button>
                </div>
              </td>
              <td className="p-3 align-top text-sm text-text-secondary whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
              <td className="p-3 align-top text-center">
                <div className="flex justify-center gap-2">
                  <button onClick={() => onProcess(tx._id, 'completed')} disabled={!!processingId} className="px-4 py-2 text-xs font-bold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {processingId === tx._id ? '...' : 'Aprobar'}
                  </button>
                  <button onClick={() => onProcess(tx._id, 'rejected')} disabled={!!processingId} className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors">
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
      // --- INICIO DE LA CORRECCIÓN ---
      // Se corrige la URL para que apunte al endpoint correcto definido en adminRoutes.js
      const { data: responseData } = await adminApi.get('/admin/withdrawals/pending', { params: { page: pageToFetch } });
      // --- FIN DE LA CORRECCIÓN ---
      setData(responseData);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al cargar las solicitudes.");
      setData({ withdrawals: [], page: 1, pages: 1 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals(1);
  }, [fetchWithdrawals]);

  const handleProcessWithdrawal = async (txId, status) => {
    if (processingId) return;
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
    
    // La URL para procesar sí es diferente y probablemente ya estaba bien, pero la verificamos
    const promise = adminApi.post(`/admin/withdrawals/${txId}/process`, { status, adminNotes: notes });

    toast.promise(promise, {
        loading: 'Procesando solicitud...',
        success: (res) => {
            fetchWithdrawals(data.page);
            return res.data.message || `Retiro procesado.`;
        },
        error: (err) => err.response?.data?.message || 'No se pudo procesar el retiro.'
    }).finally(() => {
      setProcessingId(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
        <h1 className="text-2xl font-semibold mb-1 flex items-center gap-3"><HiOutlineReceiptRefund /> Solicitudes de Retiro Pendientes</h1>
        <p className="text-text-secondary">Aprueba o rechaza las solicitudes de retiro de los usuarios.</p>
      </div>

      <div className="bg-dark-secondary rounded-lg border border-white/10">
        {isLoading ? <div className="flex justify-center items-center h-96"><Loader text="Cargando solicitudes..." /></div>
        : data.withdrawals.length > 0 ? (
            <>
              <WithdrawalsTable withdrawals={data.withdrawals} onProcess={handleProcessWithdrawal} processingId={processingId} />
              <div className="p-4 border-t border-white/10">
                <Pagination currentPage={data.page} totalPages={data.pages} onPageChange={fetchWithdrawals} />
              </div>
            </>
          )
        : (
            <div className="text-center py-16 text-text-secondary">
              <h3 className="text-lg font-semibold text-white">¡Todo en orden!</h3>
              <p>No hay solicitudes de retiro pendientes.</p>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default AdminWithdrawalsPage;