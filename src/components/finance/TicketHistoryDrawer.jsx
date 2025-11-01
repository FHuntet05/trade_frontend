import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiClock, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import api from '@/api/axiosConfig';
import Loader from '@/components/common/Loader';
import useUserStore from '@/store/userStore';

const STATUS_ORDER = ['pending', 'awaiting_manual_review', 'processing', 'completed', 'expired', 'cancelled', 'rejected'];

const statusConfig = {
  pending: { label: 'Pendiente', icon: <FiClock />, tone: 'text-yellow-400', badge: 'bg-yellow-500/15 text-yellow-200' },
  awaiting_manual_review: { label: 'En revisión manual', icon: <FiInfo />, tone: 'text-blue-400', badge: 'bg-blue-500/15 text-blue-200' },
  processing: { label: 'En proceso', icon: <FiInfo />, tone: 'text-blue-400', badge: 'bg-blue-500/15 text-blue-200' },
  completed: { label: 'Completado', icon: <FiCheckCircle />, tone: 'text-green-400', badge: 'bg-green-500/15 text-green-200' },
  expired: { label: 'Expirado', icon: <FiAlertTriangle />, tone: 'text-red-400', badge: 'bg-red-500/15 text-red-200' },
  cancelled: { label: 'Cancelado', icon: <FiAlertTriangle />, tone: 'text-red-400', badge: 'bg-red-500/15 text-red-200' },
  rejected: { label: 'Rechazado', icon: <FiAlertTriangle />, tone: 'text-red-400', badge: 'bg-red-500/15 text-red-200' },
};

const tabs = [
  { key: 'tickets', label: 'Tickets de depósito' },
  { key: 'investments', label: 'Ganancias esperadas' },
];

const TicketHistoryDrawer = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;

    const fetchTickets = async () => {
      setIsLoadingTickets(true);
      try {
        const { data } = await api.get('/deposits/my-tickets?limit=50');
        if (!isCancelled && data?.data) {
          setTickets(data.data);
        }
      } catch (error) {
        if (!isCancelled) {
          setTickets([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingTickets(false);
        }
      }
    };

    const fetchTransactions = async () => {
      setIsLoadingTransactions(true);
      try {
        const { data } = await api.get('/user/transactions');
        if (!isCancelled) {
          setTransactions(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!isCancelled) {
          setTransactions([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingTransactions(false);
        }
      }
    };

    fetchTickets();
    fetchTransactions();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  const groupedTickets = useMemo(() => {
    const groups = STATUS_ORDER.reduce((acc, status) => {
      acc[status] = [];
      return acc;
    }, {});

    tickets.forEach((ticket) => {
      const bucket = groups[ticket.status] || (groups[ticket.status] = []);
      bucket.push(ticket);
    });

    return groups;
  }, [tickets]);

  const statusDisplayOrder = useMemo(() => {
    const baseOrder = [...STATUS_ORDER];
    Object.keys(groupedTickets).forEach((status) => {
      if (!baseOrder.includes(status)) {
        baseOrder.push(status);
      }
    });

    return baseOrder.filter((status) => groupedTickets[status] && groupedTickets[status].length > 0);
  }, [groupedTickets]);

  const investmentSummaries = useMemo(() => {
    const marketPurchases = [];
    const quantitativePurchases = [];

    transactions.forEach((tx) => {
      if (tx.type === 'market_purchase' && tx.metadata) {
        const daily = parseFloat(tx.metadata.dailyProfitAmount || 0);
        const duration = parseInt(tx.metadata.durationDays || 0, 10);
        const expectedReturn = daily * duration;
        marketPurchases.push({
          id: tx._id,
          name: tx.metadata.itemName || 'Compra de mercado',
          invested: Math.abs(parseFloat(tx.amount || 0)),
          daily,
          expectedReturn,
          createdAt: tx.createdAt,
          duration,
        });
      }
      if (tx.type === 'purchase' && tx.metadata) {
        const invested = Math.abs(parseFloat(tx.metadata.investedAmount || tx.amount || 0));
        quantitativePurchases.push({
          id: tx._id,
          name: tx.metadata.planName || 'Plan cuantitativo',
          invested,
          createdAt: tx.createdAt,
        });
      }
    });

    return { marketPurchases, quantitativePurchases };
  }, [transactions]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex-1 bg-black/50" onClick={onClose} />
          <motion.aside
            className="w-full max-w-md bg-system-background h-full overflow-y-auto shadow-2xl border-l border-white/10"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-tertiary">Panel financiero</p>
                <h2 className="text-lg font-bold text-text-primary">Historial y tickets</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-system-secondary text-text-secondary hover:text-white">
                <FiX className="w-5 h-5" />
              </button>
            </header>

            <div className="px-5 py-3 border-b border-white/10 flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab.key ? 'bg-ios-green text-white' : 'bg-system-secondary text-text-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'tickets' && (
              <section className="px-5 py-4 space-y-5">
                {isLoadingTickets ? (
                  <div className="py-10"><Loader text="Cargando tickets..." /></div>
                ) : tickets.length === 0 ? (
                  <div className="p-6 bg-system-secondary rounded-ios text-center text-text-secondary text-sm">
                    Aún no tienes tickets de depósito.
                  </div>
                ) : (
                  statusDisplayOrder.map((status) => {
                    const config = statusConfig[status] || statusConfig.pending;
                    return (
                      <div key={status} className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                          <span className={`text-base ${config.tone}`}>{config.icon}</span>
                          {config.label}
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${config.badge}`}>
                            {groupedTickets[status].length}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {groupedTickets[status].map((ticket) => (
                            <div key={ticket.ticketId} className="p-4 rounded-ios bg-system-secondary border border-white/5 space-y-1">
                              <div className="flex justify-between text-sm text-text-primary">
                                <span>{ticket.currency} {Number(ticket.amount).toFixed(2)}</span>
                                <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                              </div>
                              {ticket.methodName && (
                                <p className="text-xs text-text-secondary">Método: {ticket.methodName}</p>
                              )}
                              {ticket.depositAddress && (
                                <p className="text-xs text-text-tertiary break-all">Destino: {ticket.depositAddress}</p>
                              )}
                              {ticket.instructions && ticket.methodType === 'manual' && (
                                <p className="text-xs text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 rounded-md p-2 mt-2">
                                  {ticket.instructions}
                                </p>
                              )}
                              {ticket.expiresAt && (
                                <p className="text-xs text-text-tertiary">Expira: {new Date(ticket.expiresAt).toLocaleString()}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </section>
            )}

            {activeTab === 'investments' && (
              <section className="px-5 py-4 space-y-5">
                {(isLoadingTransactions && transactions.length === 0) ? (
                  <div className="py-10"><Loader text="Cargando movimientos..." /></div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-text-primary">Compras de mercado</h3>
                      {investmentSummaries.marketPurchases.length === 0 ? (
                        <p className="text-xs text-text-secondary bg-system-secondary px-3 py-3 rounded-ios">
                          No registras compras de mercado por ahora.
                        </p>
                      ) : (
                        investmentSummaries.marketPurchases.map((item) => (
                          <div key={item.id} className="p-4 rounded-ios bg-system-secondary border border-white/5 text-sm space-y-1">
                            <div className="flex justify-between text-text-primary font-medium">
                              <span>{item.name}</span>
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-text-secondary">Inversión: {item.invested.toFixed(2)} USDT</p>
                            <p className="text-xs text-text-secondary">Ganancia diaria estimada: {item.daily.toFixed(2)} USDT</p>
                            <p className="text-xs text-text-secondary">Retorno en {item.duration} días: {(item.invested + item.expectedReturn).toFixed(2)} USDT</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-text-primary">Planes cuantitativos</h3>
                      {investmentSummaries.quantitativePurchases.length === 0 ? (
                        <p className="text-xs text-text-secondary bg-system-secondary px-3 py-3 rounded-ios">
                          Tus compras cuantitativas aparecerán aquí cuando se registren.
                        </p>
                      ) : (
                        investmentSummaries.quantitativePurchases.map((item) => (
                          <div key={item.id} className="p-4 rounded-ios bg-system-secondary border border-white/5 text-sm space-y-1">
                            <div className="flex justify-between text-text-primary font-medium">
                              <span>{item.name}</span>
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-text-secondary">Inversión: {item.invested.toFixed(2)} USDT</p>
                            <p className="text-xs text-text-tertiary">
                              Cuando el plan distribuya ganancias aparecerán aquí los totales acreditados.
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {user?.activeInvestments && user.activeInvestments.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-text-primary">Inversiones activas</h3>
                        {user.activeInvestments.map((inv, index) => (
                          <div key={`${inv.transactionId}-${index}`} className="p-3 rounded-ios bg-system-secondary border border-white/5 text-xs text-text-secondary space-y-1">
                            <p className="text-text-primary font-medium">Saldo asignado: {Number(inv.amount || 0).toFixed(2)} USDT</p>
                            {inv.symbol && <p>Activo vinculado: {inv.symbol}</p>}
                            {inv.endDate && <p>Finaliza: {new Date(inv.endDate).toLocaleDateString()}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TicketHistoryDrawer;
