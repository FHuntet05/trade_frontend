// RUTA: frontend/src/pages/DepositPage.jsx (Flow actualizado)

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiOutlineDocumentSearch, HiOutlineRefresh } from 'react-icons/hi2';
import { FiClock, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import api from '@/api/axiosConfig';
import Loader from '@/components/common/Loader';

const statusConfig = {
  pending: {
    label: 'Pendiente',
    icon: <FiClock className="text-yellow-400" />,
    badgeClass: 'bg-yellow-500/10 text-yellow-200'
  },
  processing: {
    label: 'En proceso',
    icon: <FiInfo className="text-blue-400" />,
    badgeClass: 'bg-blue-500/10 text-blue-200'
  },
  awaiting_manual_review: {
    label: 'En revisión',
    icon: <FiInfo className="text-blue-400" />,
    badgeClass: 'bg-blue-500/10 text-blue-200'
  },
  completed: {
    label: 'Completado',
    icon: <FiCheckCircle className="text-green-400" />,
    badgeClass: 'bg-green-500/10 text-green-200'
  },
  expired: {
    label: 'Expirado',
    icon: <FiAlertTriangle className="text-red-400" />,
    badgeClass: 'bg-red-500/10 text-red-200'
  },
  cancelled: {
    label: 'Cancelado',
    icon: <FiAlertTriangle className="text-red-400" />,
    badgeClass: 'bg-red-500/10 text-red-200'
  },
  rejected: {
    label: 'Rechazado',
    icon: <FiAlertTriangle className="text-red-400" />,
    badgeClass: 'bg-red-500/10 text-red-200'
  }
};

const DepositPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/deposits/my-tickets?limit=20');
      setTickets(response.data.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'No se pudieron cargar tus tickets de depósito.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const renderTicket = (ticket) => {
    const status = statusConfig[ticket.status] || statusConfig.pending;
    return (
      <div
        key={ticket.ticketId}
        className="bg-internal-card rounded-ios-xl p-4 border border-white/5 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-secondary">
            {status.icon}
            <span className={`text-xs font-semibold rounded-full px-2 py-1 ${status.badgeClass}`}>
              {status.label}
            </span>
          </div>
          <span className="text-xs text-text-tertiary">
            Creado: {new Date(ticket.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Monto</span>
          <span className="font-semibold text-text-primary">
            {Number(ticket.amount).toFixed(2)} {ticket.currency}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Método</span>
          <span className="font-semibold text-text-primary">{ticket.methodName || ticket.methodKey}</span>
        </div>

        {ticket.chain && (
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Red</span>
            <span className="font-semibold text-text-primary">{ticket.chain}</span>
          </div>
        )}

        {ticket.depositAddress && (
          <div className="flex justify-between text-xs text-text-tertiary">
            <span>Dirección</span>
            <span className="text-right break-all max-w-[60%]">{ticket.depositAddress}</span>
          </div>
        )}

        {ticket.status === 'pending' && ticket.expiresAt && (
          <div className="text-xs text-yellow-300">
            Expira: {new Date(ticket.expiresAt).toLocaleString()}
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/deposit/pending/${ticket.ticketId}`)}
          className="w-full bg-system-secondary text-text-primary py-2 rounded-ios-button text-sm font-semibold"
        >
          Ver detalles
        </motion.button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-system-background pb-24">
      <div className="p-4 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-text-primary">
            <HiChevronLeft size={28} />
          </button>
          <h1 className="text-xl font-ios-display font-bold text-text-primary">
            Depósitos
          </h1>
          <div className="w-7"></div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/deposit/create')}
          className="w-full bg-ios-green text-white py-4 rounded-ios-button font-ios font-bold text-lg"
        >
          Crear nuevo depósito
        </motion.button>

        <div className="bg-internal-card rounded-ios-xl p-4 border border-white/5">
          <h2 className="text-lg font-ios-display font-semibold text-text-primary mb-1">
            ¿Cómo funciona?
          </h2>
          <p className="text-sm text-text-secondary">
            Genera un ticket para obtener una dirección única de depósito. Envía el monto indicado y el sistema acreditará
            automáticamente los fondos cuando la transacción se confirme en la blockchain.
          </p>
        </div>

        <div className="flex items-center justify-between text-text-secondary text-sm">
          <span className="flex items-center gap-2">
            <HiOutlineDocumentSearch /> Tus tickets recientes
          </span>
          <button onClick={loadTickets} className="flex items-center gap-1 text-ios-green">
            <HiOutlineRefresh /> Actualizar
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader text="Cargando tickets..." />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-ios-xl p-4 text-red-200 text-sm">
            {error}
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-system-secondary rounded-ios-xl p-6 text-center text-text-secondary text-sm">
            No tienes depósitos registrados. Crea tu primer ticket para obtener una dirección única.
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(renderTicket)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositPage;