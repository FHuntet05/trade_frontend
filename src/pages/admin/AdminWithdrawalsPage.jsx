// frontend/src/pages/admin/AdminWithdrawalsPage.jsx (COMPLETO Y CORREGIDO)

import React, { useState, useEffect, useCallback } from 'react';
import useAdminStore from '../../store/adminStore'; // Importamos el store de admin para el token
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

import Loader from '../../components/common/Loader';
import { HiOutlineClipboardDocument, HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';

// El componente de la tabla no necesita cambios, pero lo incluimos para que el archivo esté completo.
const WithdrawalsTable = ({ withdrawals, onProcess }) => {
  const [copiedAddress, setCopiedAddress] = useState('');

  const handleCopy = (text) => {
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
                  <img className="w-8 h-8 rounded-full" src={tx.user.photoUrl || '/assets/images/user-avatar-placeholder.png'} alt="avatar" />
                  <span>{tx.user.username}</span>
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
  const [isLoading, setIsLoading] = useState(true);
  const { adminInfo } = useAdminStore(); // Obtenemos la info del admin desde el store

  const fetchWithdrawals = useCallback(async () => {
    if (!adminInfo?.token) {
        // No intentes cargar si no hay token, evita errores innecesarios
        return;
    }
    setIsLoading(true);
    try {
      // --- CORRECCIÓN CLAVE ---
      // 1. La ruta correcta es /api/admin/withdrawals como está definida en adminRoutes.js
      // 2. Pasamos el token de autorización en los headers para que el middleware `protect` y `isAdmin` nos den acceso.
      const { data } = await api.get('/api/admin/withdrawals', { // <-- La ruta correcta
    headers: { Authorization: `Bearer ${adminInfo.token}` },
});
      setWithdrawals(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudieron cargar los retiros.');
    } finally {
      setIsLoading(false);
    }
  }, [adminInfo]); // Se ejecuta cuando adminInfo (y su token) esté disponible

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

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
      // --- CORRECCIÓN CLAVE ---
      // También necesitamos enviar el token aquí para la autorización
      await api.put(`/api/admin/withdrawals/${txId}`, { newStatus, adminNotes: notes }, {
        headers: { Authorization: `Bearer ${adminInfo.token}` },
      });
      toast.success(`Retiro procesado como "${newStatus}".`);
      setWithdrawals(prev => prev.filter(tx => tx._id !== txId));
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
        <WithdrawalsTable withdrawals={withdrawals} onProcess={handleProcessWithdrawal} />
      ) : (
        <div className="text-center py-16 text-text-secondary">
          <p>¡Buen trabajo! No hay solicitudes de retiro pendientes.</p>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawalsPage;