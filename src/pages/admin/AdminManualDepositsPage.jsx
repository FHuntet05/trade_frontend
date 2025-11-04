// RUTA: frontend/src/pages/admin/AdminManualDepositsPage.jsx
// --- VERSIÓN FINAL Y COMPLETA CON INTEGRACIÓN DEL MODAL ---

import React, 'useState, useEffect, useCallback } from 'react';
import adminApi from '@/pages/admin/api/adminApi';
import toast from 'react-hot-toast';
import Loader from '@/components/common/Loader';
import Pagination from '@/components/common/Pagination';
import { HiOutlineDocumentMagnifyingGlass } from 'react-icons/hi2';
import TelegramAvatar from '@/components/common/TelegramAvatar';
// --- INICIO DE LA MODIFICACIÓN ---
// Se importa el nuevo componente modal que hemos creado.
import ProcessDepositModal from './components/ProcessDepositModal'; 
// --- FIN DE LA MODIFICACIÓN ---

const DepositsTable = ({ tickets, onProcessClick }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
          <tr>
            <th className="p-3">Usuario</th>
            <th className="p-3">Monto Solicitado</th>
            <th className="p-3">Método</th>
            <th className="p-3">Fecha de Creación</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {tickets.map((ticket) => (
            <tr key={ticket.ticketId} className="hover:bg-dark-tertiary/50 transition-colors">
              <td className="p-3 align-top">
                <div className="flex items-center gap-3">
                  <TelegramAvatar
                    telegramId={ticket.user?.telegramId}
                    alt={ticket.user?.username || 'avatar'}
                    className="w-8 h-8 rounded-full bg-dark-primary object-cover"
                  />
                  <span className="font-medium">{ticket.user?.username || 'N/A'}</span>
                </div>
              </td>
              <td className="p-3 align-top font-mono text-lg text-green-400 font-bold">
                {Number(ticket.amount).toFixed(2)}
                <span className="text-sm text-text-secondary ml-1">{ticket.currency}</span>
              </td>
              <td className="p-3 align-top">
                <div className="flex flex-col">
                    <span className="font-semibold">{ticket.methodName}</span>
                    <span className="text-xs text-text-secondary">{ticket.chain}</span>
                </div>
              </td>
              <td className="p-3 align-top text-sm text-text-secondary whitespace-nowrap">
                {new Date(ticket.createdAt).toLocaleString()}
              </td>
              <td className="p-3 align-top text-center">
                <button 
                  onClick={() => onProcessClick(ticket)} 
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Revisar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdminManualDepositsPage = () => {
  const [data, setData] = useState({ tickets: [], pagination: { currentPage: 1, totalPages: 1 } });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchManualDeposits = useCallback(async (pageToFetch = 1) => {
    setIsLoading(true);
    try {
      const response = await adminApi.get('/admin/deposits/manual-review', { params: { page: pageToFetch } });
      setData(response.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al cargar los depósitos manuales.");
      setData({ tickets: [], pagination: { currentPage: 1, totalPages: 1 } });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManualDeposits(1);
  }, [fetchManualDeposits]);
  
  const handleProcessClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleModalClose = () => {
    setSelectedTicket(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    // Refrescar la lista de tickets para que el ticket procesado desaparezca.
    fetchManualDeposits(data.pagination.currentPage);
  };

  return (
    <div className="space-y-6">
      <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
        <h1 className="text-2xl font-semibold mb-1 flex items-center gap-3">
            <HiOutlineDocumentMagnifyingGlass /> Depósitos para Revisión Manual
        </h1>
        <p className="text-text-secondary">Aprueba o rechaza los depósitos que requieren verificación manual.</p>
      </div>

      <div className="bg-dark-secondary rounded-lg border border-white/10">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader text="Cargando depósitos..." />
          </div>
        ) : data.tickets.length > 0 ? (
            <>
              <DepositsTable tickets={data.tickets} onProcessClick={handleProcessClick} />
              <div className="p-4 border-t border-white/10">
                <Pagination 
                  currentPage={data.pagination.currentPage} 
                  totalPages={data.pagination.totalPages} 
                  onPageChange={fetchManualDeposits} 
                />
              </div>
            </>
          )
        : (
            <div className="text-center py-16 text-text-secondary">
              <h3 className="text-lg font-semibold text-white">¡Todo al día!</h3>
              <p>No hay depósitos manuales pendientes de revisión.</p>
            </div>
          )
        }
      </div>
      
      {/* --- INICIO DE LA MODIFICACIÓN --- */}
      {/* Ahora se renderiza el modal cuando hay un ticket seleccionado,
          pasándole todas las props necesarias para que funcione. */}
      {selectedTicket && (
        <ProcessDepositModal 
          isOpen={!!selectedTicket}
          onClose={handleModalClose}
          ticket={selectedTicket}
          onSuccess={handleSuccess}
        />
      )}
      {/* --- FIN DE LA MODIFICACIÓN --- */}
    </div>
  );
};

export default AdminManualDepositsPage;