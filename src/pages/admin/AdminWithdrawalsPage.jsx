// frontend/src/pages/admin/AdminWithdrawalsPage.jsx (VERSIÓN v17.0 - CORREGIDA Y ESTABILIZADA)
import React, { useState, useEffect, useCallback } from 'react';
import useAdminStore from '../../store/adminStore';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { HiOutlineClipboardDocument, HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';

// --- El componente de la tabla no tiene errores, pero lo incluyo para que el archivo esté completo. ---
// He hecho una pequeña mejora para manejar el caso donde metadata o withdrawalAddress no existen.
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
              <td className="px-6 py-4 font-mono">{tx.amount.toFixed(2)}</td>
              <td className="px-6 py-4 font-mono text-text-secondary">
                <div className="flex items-center gap-2">
                  {/* MEJORA: Asegurarse de que metadata.walletAddress existe antes de mostrarlo */}
                  <span className="truncate max-w-xs">{tx.metadata?.walletAddress || 'N/A'}</span>
                  {tx.metadata?.walletAddress && (
                    <button onClick={() => handleCopy(tx.metadata.walletAddress)} className="text-gray-400 hover:text-white">
                      {copiedAddress === tx.metadata.walletAddress ? <HiOutlineClipboardDocumentCheck className="w-5 h-5 text-green-400" /> : <HiOutlineClipboardDocument className="w-5 h-5" />}
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
  // ==================== INICIO DEL BLOQUE CORREGIDO ====================
  
  // 1. Estados definidos correctamente. `error` ahora existe.
  const [withdrawals, setWithdrawals] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true); // Se mantiene en true al inicio.
  const [error, setError] = useState(null); // Estado de error añadido.
  const [processingId, setProcessingId] = useState(null);
  const { adminInfo } = useAdminStore();

  // 2. La función `fetchWithdrawals` ahora es "Callback" para estabilidad en `useEffect`.
  // Y lo más importante: ¡usa los setters de estado correctos! (`setWithdrawals`, `setError`).
  const fetchWithdrawals = useCallback(async (targetPage = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/api/admin/withdrawals/pending?page=${targetPage}`);
      // Se usan los setters correctos
      setWithdrawals(data.withdrawals);
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "No se pudieron cargar las solicitudes. Intente de nuevo más tarde.";
      console.error("Error al obtener retiros:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      // ESTO AHORA SÍ SE EJECUTARÁ SIEMPRE.
      setIsLoading(false);
    }
  }, []); // El array vacío significa que la función no se recrea en cada render.

  // 3. `useEffect` añadido. Esto hace que `fetchWithdrawals` se llame AUTOMÁTICAMENTE
  // una sola vez cuando el componente se carga por primera vez.
  useEffect(() => {
    fetchWithdrawals(1);
  }, [fetchWithdrawals]);

  // ==================== FIN DEL BLOQUE CORREGIDO ====================

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
      if (!window.confirm("¿Estás SEGURO de que quieres APROBAR este retiro? Esta acción es para confirmar que ya has enviado los fondos manualmente desde tu exchange. Esta acción es IRREVERSIBLE.")) {
        setProcessingId(null);
        return;
      }
    }
    
    // NOTA: La ruta correcta, según tu archivo de rutas, es `/process`.
    const processPromise = api.put(`/api/admin/withdrawals/${txId}/process`, { status, adminNotes: notes });

    try {
        await toast.promise(processPromise, {
            loading: 'Actualizando estado en la base de datos...',
            success: (res) => {
                // Para una mejor UX, recargamos la lista después de procesar.
                fetchWithdrawals(page);
                return res.data.message || `Retiro procesado como "${status}".`;
            },
            error: (err) => err.response?.data?.message || 'No se pudo procesar el retiro.'
        });
    } catch (error) {
        console.error("Error al procesar retiro:", error);
        // El toast.promise ya maneja el mensaje de error al usuario.
    } finally {
        setProcessingId(null);
    }
  };

  // El renderizado ahora también maneja el estado de error.
  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-96"><Loader text="Cargando solicitudes..." /></div>;
    }
    if (error) {
      return <div className="text-center py-16 text-red-400"><p>{error}</p></div>;
    }
    if (withdrawals.length > 0) {
      return (
        <>
          <WithdrawalsTable withdrawals={withdrawals} onProcess={handleProcessWithdrawal} processingId={processingId} />
          {pages > 1 && (
            <div className="mt-6 text-center">
              {/* Aquí se podría implementar la paginación */}
            </div>
          )}
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