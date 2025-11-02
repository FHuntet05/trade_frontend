import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiClock, FiCheckCircle, FiAlertTriangle, FiInfo, FiArrowRightCircle, FiZap, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
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
  const [cancellingTicketId, setCancellingTicketId] = useState(null);
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

  const ticketStats = useMemo(() => {
    const base = {
      totalCount: tickets.length,
      totalAmount: 0,
      pendingCount: 0,
      pendingAmount: 0,
      completedCount: 0,
      completedAmount: 0,
    };

    return tickets.reduce((acc, ticket) => {
      const value = Number(ticket.amount) || 0;
      acc.totalAmount += value;

      if (ticket.status === 'pending' || ticket.status === 'awaiting_manual_review' || ticket.status === 'processing') {
        acc.pendingCount += 1;
        acc.pendingAmount += value;
      }

      if (ticket.status === 'completed') {
        acc.completedCount += 1;
        acc.completedAmount += value;
      }

      return acc;
    }, base);
  }, [tickets]);

  const handleCancelTicket = async (ticketId) => {
    setCancellingTicketId(ticketId);
    try {
      const { data } = await api.put(`/deposits/ticket/${ticketId}/cancel`);
      toast.success(data?.message || 'Ticket cancelado');
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.ticketId === ticketId
            ? { ...ticket, ...(data?.data || {}), status: 'cancelled' }
            : ticket
        )
      );
    } catch (error) {
      const message = error.response?.data?.message || 'No se pudo cancelar el ticket.';
      toast.error(message);
    } finally {
      setCancellingTicketId(null);
    }
  };

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
            className="w-full max-w-md bg-system-background h-full shadow-2xl border-l border-white/10 flex flex-col"
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

            <div className="flex-1 overflow-y-auto pb-24">
              {activeTab === 'tickets' && (
                <section className="px-5 pt-4 pb-2 border-b border-white/5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-ios bg-system-secondary/70 border border-white/10 p-3">
                    <p className="text-xs text-text-tertiary uppercase tracking-wide">Pendientes</p>
                    <p className="text-lg font-semibold text-text-primary">{ticketStats.pendingCount}</p>
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {ticketStats.pendingAmount.toFixed(2)} USDT en espera
                    </p>
                  </div>
                  <div className="rounded-ios bg-ios-green/10 border border-ios-green/20 p-3">
                    <p className="text-xs text-ios-green uppercase tracking-wide">Acreditado</p>
                    <p className="text-lg font-semibold text-text-primary">{ticketStats.completedCount}</p>
                    <p className="text-xs text-ios-green flex items-center gap-1">
                      <FiCheckCircle className="w-3 h-3" />
                      {ticketStats.completedAmount.toFixed(2)} USDT recibidos
                    </p>
                  </div>
                </div>
                <div className="px-3 py-2 rounded-ios bg-system-secondary/60 text-xs text-text-secondary flex justify-between">
                  <span>Total de tickets</span>
                  <span>{ticketStats.totalCount} • {ticketStats.totalAmount.toFixed(2)} USDT</span>
                </div>
              </section>
              )}

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
                            <motion.div
                              key={ticket.ticketId}
                              layout
                              className="p-4 rounded-2xl bg-system-secondary border border-white/8 space-y-3 shadow-[0_12px_24px_-18px_rgba(0,0,0,0.65)] hover:border-ios-green/40 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3 text-sm">
                                <div className="text-text-primary text-base font-semibold tracking-tight">
                                  {ticket.currency} {Number(ticket.amount).toFixed(2)}
                                </div>
                                <div className="text-xs text-text-tertiary text-right leading-tight font-medium">
                                  {new Date(ticket.createdAt).toLocaleString()}
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                                {ticket.methodName && (
                                  <span className="px-2 py-1 rounded-full bg-white/5 text-text-secondary border border-white/10">
                                    {ticket.methodName}
                                  </span>
                                )}
                                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                                  {ticket.methodType === 'manual' ? 'Manual' : 'Automático'}
                                </span>
                                {ticket.chain && (
                                  <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{ticket.chain}</span>
                                )}
                              </div>
                              {ticket.depositAddress && (
                                <div className="text-xs font-medium text-text-secondary bg-black/15 border border-white/8 rounded-lg p-2.5 break-all">
                                  <span className="text-text-tertiary uppercase tracking-wide mr-1">Destino:</span>
                                  {ticket.depositAddress}
                                </div>
                              )}
                              {ticket.instructions && ticket.methodType === 'manual' && (
                                <div className="rounded-xl border border-yellow-400/70 bg-[#FEF3C7]/90 px-3 py-2">
                                  <p className="text-[11px] font-semibold text-[#7C5200] leading-snug">
                                    {ticket.instructions}
                                  </p>
                                </div>
                              )}
                              {ticket.expiresAt && (
                                <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wide">
                                  Expira: {new Date(ticket.expiresAt).toLocaleString()}
                                </p>
                              )}
                              <div className="flex flex-col gap-2 mt-1">
                                {['pending', 'processing', 'awaiting_manual_review'].includes(ticket.status) && (
                                  <button
                                    onClick={() => window.open(`/deposit/pending/${ticket.ticketId}`, '_self')}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-ios-green/40 bg-ios-green/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-ios-green hover:border-ios-green/80 hover:bg-ios-green/20 hover:text-white transition-colors"
                                  >
                                    Ver detalle
                                    <FiArrowRightCircle className="w-4 h-4" />
                                  </button>
                                )}

                                {['pending', 'awaiting_manual_review'].includes(ticket.status) && (
                                  <button
                                    onClick={() => handleCancelTicket(ticket.ticketId)}
                                    disabled={cancellingTicketId === ticket.ticketId}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-red-400 bg-red-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-red-500 hover:border-red-300 hover:bg-red-500/20 hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    <FiXCircle className="w-4 h-4" />
                                    {cancellingTicketId === ticket.ticketId ? 'Cancelando...' : 'Cancelar ticket'}
                                  </button>
                                )}
                              </div>
                            </motion.div>
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
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-ios bg-system-secondary/70 border border-white/10 p-3">
                        <p className="text-xs text-text-tertiary uppercase tracking-wide">Ganancia diaria total</p>
                        <p className="text-lg font-semibold text-text-primary">
                          {investmentSummaries.marketPurchases.reduce((acc, item) => acc + (item.daily || 0), 0).toFixed(2)} USDT
                        </p>
                        <p className="text-xs text-text-secondary">Mercado + planes activos</p>
                      </div>
                      <div className="rounded-ios bg-ios-green/10 border border-ios-green/20 p-3">
                        <p className="text-xs text-ios-green uppercase tracking-wide">Capital invertido</p>
                        <p className="text-lg font-semibold text-text-primary">
                          {(investmentSummaries.marketPurchases.reduce((acc, item) => acc + (item.invested || 0), 0) + investmentSummaries.quantitativePurchases.reduce((acc, item) => acc + (item.invested || 0), 0)).toFixed(2)} USDT
                        </p>
                        <p className="text-xs text-text-secondary">Suma de compras registradas</p>
                      </div>
                    </div>

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
                            {inv.type && (
                              <p className="uppercase tracking-wide text-[10px] text-text-tertiary">
                                Tipo: {inv.type === 'quantitative' ? 'Plan Cuantitativo' : 'Mercado'}
                              </p>
                            )}
                            {inv.endDate && <p>Finaliza: {new Date(inv.endDate).toLocaleDateString()}</p>}
                            {(inv.dailyProfitAmount ?? inv.dailyProfit) ? (
                              <p className="text-ios-green flex items-center gap-1">
                                <FiZap className="w-3 h-3" /> Rendimiento diario:{' '}
                                {Number((inv.dailyProfitAmount ?? inv.dailyProfit) || 0).toFixed(2)} USDT
                              </p>
                            ) : null}
                            {typeof inv.accruedProfit === 'number' && inv.accruedProfit > 0 && (
                              <p>Ganancia acumulada: {Number(inv.accruedProfit).toFixed(2)} USDT</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TicketHistoryDrawer;