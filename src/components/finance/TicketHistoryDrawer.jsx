import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiClock, FiCheckCircle, FiAlertTriangle, FiInfo, FiArrowRightCircle, FiZap, FiXCircle, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/api/axiosConfig';
import Loader from '@/components/common/Loader';
import useUserStore from '@/store/userStore';
import { useTranslation } from 'react-i18next';

const STATUS_ORDER = ['pending', 'awaiting_manual_review', 'processing', 'completed', 'expired', 'cancelled', 'rejected'];

const statusConfig = (t) => ({
  pending: { label: t('ticketDrawer.status.pending'), icon: <FiClock />, tone: 'text-yellow-400', badge: 'bg-yellow-500/15 text-yellow-200' },
  awaiting_manual_review: { label: t('ticketDrawer.status.awaiting_manual_review'), icon: <FiInfo />, tone: 'text-blue-400', badge: 'bg-blue-500/15 text-blue-200' },
  processing: { label: t('ticketDrawer.status.processing'), icon: <FiInfo />, tone: 'text-blue-400', badge: 'bg-blue-500/15 text-blue-200' },
  completed: { label: t('ticketDrawer.status.completed'), icon: <FiCheckCircle />, tone: 'text-green-400', badge: 'bg-green-500/15 text-green-200' },
  expired: { label: t('ticketDrawer.status.expired'), icon: <FiAlertTriangle />, tone: 'text-red-400', badge: 'bg-red-500/15 text-red-200' },
  cancelled: { label: t('ticketDrawer.status.cancelled'), icon: <FiAlertTriangle />, tone: 'text-red-400', badge: 'bg-red-500/15 text-red-200' },
  rejected: { label: t('ticketDrawer.status.rejected'), icon: <FiAlertTriangle />, tone: 'text-red-400', badge: 'bg-red-500/15 text-red-200' },
});

const makeTabs = (t) => ([
  { key: 'tickets', label: t('ticketDrawer.tabs.tickets'), icon: <FiDollarSign /> },
  { key: 'market', label: t('ticketDrawer.tabs.market'), icon: <FiTrendingUp /> },
  { key: 'quantitative', label: t('ticketDrawer.tabs.quantitative'), icon: <FiZap /> },
]);

const TicketHistoryDrawer = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [cancellingTicketId, setCancellingTicketId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const user = useUserStore((state) => state.user);
  const { t, i18n } = useTranslation();
  const tabs = makeTabs(t);

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
  toast.success(data?.message || t('ticketDrawer.toasts.cancelSuccess'));
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.ticketId === ticketId
            ? { ...ticket, ...(data?.data || {}), status: 'cancelled' }
            : ticket
        )
      );
    } catch (error) {
  const message = error.response?.data?.message || t('ticketDrawer.toasts.cancelError');
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
        const originalPrice = parseFloat(tx.metadata.originalPrice || 0);
        const metaRoi = parseFloat(tx.metadata.profitPercentage || 0);
        const computedRoi = originalPrice > 0 ? (expectedReturn / originalPrice) * 100 : 0;
        const roiPercentage = Number.isFinite(metaRoi) && metaRoi > 0 ? metaRoi : computedRoi;
        marketPurchases.push({
          id: tx._id,
          name: tx.metadata.itemName || 'Compra de mercado',
          symbol: tx.metadata.symbol || 'N/A',
          invested: Math.abs(parseFloat(tx.amount || 0)),
          daily,
          expectedReturn,
          createdAt: tx.createdAt,
          duration,
          profitPercentage: roiPercentage,
        });
      }
      if (tx.type === 'purchase' && tx.metadata) {
        const invested = Math.abs(parseFloat(tx.metadata.investedAmount || tx.amount || 0));
        const duration = parseInt(tx.metadata.durationDays || 0, 10);
        const metaRoi = parseFloat(tx.metadata.profitPercentage || 0);
        quantitativePurchases.push({
          id: tx._id,
          name: tx.metadata.planName || 'Plan cuantitativo',
          invested,
          createdAt: tx.createdAt,
          duration,
          profitPercentage: Number.isFinite(metaRoi) && metaRoi > 0 ? metaRoi : 0,
        });
      }
    });

    return { marketPurchases, quantitativePurchases };
  }, [transactions]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex font-ios"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex-1 bg-black/50" onClick={onClose} />
          <motion.aside
            className="w-full max-w-md bg-system-background h-full shadow-2xl border-l border-white/10 flex flex-col font-ios"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-tertiary font-semibold">{t('ticketDrawer.header.panel')}</p>
                <h2 className="text-lg font-bold text-text-primary font-ios-display">{t('ticketDrawer.header.title')}</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-system-secondary text-text-secondary hover:text-text-primary transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </header>

            {/* Tabs */}
            <div className="px-4 py-3 border-b border-white/10 bg-white flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.key 
                      ? 'bg-ios-green text-white shadow-ios-button' 
                      : 'bg-system-secondary text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-24 bg-system-background">{activeTab === 'tickets' && (
                <>
                  <section className="px-5 pt-4 pb-3 space-y-3 bg-white">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-ios-xl bg-gradient-to-br from-yellow-50 to-yellow-100/80 border border-yellow-200/50 p-4 shadow-ios-card">
                        <p className="text-xs text-yellow-700 uppercase tracking-wide font-bold">{t('ticketDrawer.stats.pending')}</p>
                        <p className="text-2xl font-bold text-yellow-900 font-ios-display">{ticketStats.pendingCount}</p>
                        <p className="text-xs text-yellow-600 flex items-center gap-1 mt-1 font-medium">
                          <FiClock className="w-3 h-3" />
                          ${ticketStats.pendingAmount.toFixed(2)} USDT
                        </p>
                      </div>
                      <div className="rounded-ios-xl bg-gradient-to-br from-green-50 to-ios-green/10 border border-ios-green/20 p-4 shadow-ios-card">
                        <p className="text-xs text-ios-green uppercase tracking-wide font-bold">{t('ticketDrawer.stats.completed')}</p>
                        <p className="text-2xl font-bold text-ios-green font-ios-display">{ticketStats.completedCount}</p>
                        <p className="text-xs text-ios-green flex items-center gap-1 mt-1 font-medium">
                          <FiCheckCircle className="w-3 h-3" />
                          ${ticketStats.completedAmount.toFixed(2)} USDT
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-3 rounded-ios-xl bg-gray-50 border border-gray-200 text-xs text-text-secondary flex justify-between items-center font-medium">
                      <span>{t('ticketDrawer.stats.totalTickets')}</span>
                      <span className="font-semibold text-text-primary">{ticketStats.totalCount} • ${ticketStats.totalAmount.toFixed(2)}</span>
                    </div>
                  </section>

                  <section className="px-5 py-4 space-y-5">
                    {isLoadingTickets ? (
                      <div className="py-10"><Loader text={t('ticketDrawer.loaders.tickets')} /></div>
                    ) : tickets.length === 0 ? (
                      <div className="p-6 bg-white rounded-ios-xl text-center text-text-secondary text-sm border border-gray-200 shadow-ios-card">
                        <p className="font-medium">{t('ticketDrawer.empty.tickets.title')}</p>
                        <p className="text-xs text-text-tertiary mt-1">{t('ticketDrawer.empty.tickets.subtitle')}</p>
                      </div>
                    ) : (
                      statusDisplayOrder.map((status) => {
                        const cfgMap = statusConfig(t);
                        const config = cfgMap[status] || cfgMap.pending;
                        return (
                          <div key={status} className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
                              <span className={`text-base ${config.tone}`}>{config.icon}</span>
                              {config.label}
                              <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-semibold ${config.badge}`}>
                                {groupedTickets[status].length}
                              </span>
                            </div>
                            <div className="space-y-3">
                              {groupedTickets[status].map((ticket) => (
                                <motion.div
                                  key={ticket.ticketId}
                                  layout
                                  className="p-4 rounded-ios-xl bg-white border border-gray-200 space-y-3 shadow-ios-card hover:border-ios-green/40 hover:shadow-lg transition-all"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-xl font-bold text-text-primary font-ios-display">
                                        ${Number(ticket.amount).toFixed(2)}
                                      </span>
                                      <span className="text-sm font-semibold text-text-secondary">{ticket.currency}</span>
                                    </div>
                                    <div className="text-xs text-text-tertiary text-right leading-tight font-medium">
                                      {new Date(ticket.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'en' ? 'en-US' : 'es-ES', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {ticket.methodName && (
                                      <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                                        {ticket.methodName}
                                      </span>
                                    )}
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                      ticket.methodType === 'automatic' 
                                        ? 'bg-green-50 text-green-700 border border-green-200' 
                                        : 'bg-orange-50 text-orange-700 border border-orange-200'
                                    }`}>
                                      {ticket.methodType === 'manual' ? t('ticketDrawer.labels.manual') : t('ticketDrawer.labels.automatic')}
                                    </span>
                                    {ticket.chain && (
                                      <span className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                                        {ticket.chain}
                                      </span>
                                    )}
                                  </div>
                                  {ticket.depositAddress && (
                                    <div className="text-xs font-mono text-text-secondary bg-gray-50 border border-gray-200 rounded-ios p-3 break-all">
                                      <span className="text-text-tertiary uppercase tracking-wide mr-1 font-bold">{t('ticketDrawer.labels.destination')}:</span>
                                      {ticket.depositAddress}
                                    </div>
                                  )}
                                  {ticket.instructions && ticket.methodType === 'manual' && (
                                    <div className="rounded-ios border-2 border-yellow-400 bg-yellow-50 px-3 py-2.5">
                                      <p className="text-xs font-semibold text-yellow-800 leading-snug">
                                        {ticket.instructions}
                                      </p>
                                    </div>
                                  )}
                                    {ticket.expiresAt && (
                                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                                      ⏱️ {t('ticketDrawer.labels.expires')}: {new Date(ticket.expiresAt).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'en' ? 'en-US' : 'es-ES')}
                                    </p>
                                  )}
                                  <div className="flex flex-col gap-2 pt-2">
                                    {['pending', 'processing', 'awaiting_manual_review'].includes(ticket.status) && (
                                      <button
                                        onClick={() => window.open(`/deposit/pending/${ticket.ticketId}`, '_self')}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-ios-green bg-ios-green/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-ios-green hover:bg-ios-green hover:text-white transition-all shadow-ios-button"
                                      >
                                        {t('ticketDrawer.buttons.viewDetails')}
                                        <FiArrowRightCircle className="w-4 h-4" />
                                      </button>
                                    )}

                                    {['pending', 'awaiting_manual_review'].includes(ticket.status) && (
                                      <button
                                        onClick={() => handleCancelTicket(ticket.ticketId)}
                                        disabled={cancellingTicketId === ticket.ticketId}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-red-500 bg-red-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-red-600 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-ios-button"
                                      >
                                        <FiXCircle className="w-4 h-4" />
                                        {cancellingTicketId === ticket.ticketId ? t('ticketDrawer.buttons.cancelling') : t('ticketDrawer.buttons.cancel')}
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
                </>
              )}

              {/* Market Tab - Inversiones de mercado */}
              {activeTab === 'market' && (
                <section className="px-5 py-4 space-y-4">
                  {isLoadingTransactions ? (
                    <div className="py-10"><Loader text={t('ticketDrawer.loaders.market')} /></div>
                  ) : (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-ios-xl bg-gradient-to-br from-blue-50 to-blue-100/80 border border-blue-200/50 p-4 shadow-ios-card">
                          <p className="text-xs text-blue-700 uppercase tracking-wide font-bold flex items-center gap-1">
                            <FiTrendingUp className="w-3 h-3" />
                            {t('ticketDrawer.market.totalInvested')}
                          </p>
                          <p className="text-2xl font-bold text-blue-900 font-ios-display mt-1">
                            ${investmentSummaries.marketPurchases.reduce((acc, item) => acc + (item.invested || 0), 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            {investmentSummaries.marketPurchases.length} {t('ticketDrawer.market.assets')}
                          </p>
                        </div>
                        <div className="rounded-ios-xl bg-gradient-to-br from-green-50 to-ios-green/10 border border-ios-green/20 p-4 shadow-ios-card">
                          <p className="text-xs text-ios-green uppercase tracking-wide font-bold flex items-center gap-1">
                            <FiZap className="w-3 h-3" />
                            {t('ticketDrawer.market.dailyProfit')}
                          </p>
                          <p className="text-2xl font-bold text-ios-green font-ios-display mt-1">
                            ${investmentSummaries.marketPurchases.reduce((acc, item) => acc + (item.daily || 0), 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-ios-green/80 mt-1 font-medium">
                            {t('ticketDrawer.market.activeYield')}
                          </p>
                        </div>
                      </div>

                      {/* Market Items */}
                      {investmentSummaries.marketPurchases.length === 0 ? (
                        <div className="p-8 bg-white rounded-ios-xl text-center border border-gray-200 shadow-ios-card">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                            <FiTrendingUp className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="font-semibold text-text-primary mb-1">{t('ticketDrawer.market.emptyTitle')}</p>
                          <p className="text-xs text-text-tertiary">{t('ticketDrawer.market.emptySubtitle')}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {investmentSummaries.marketPurchases.map((item) => (
                            <motion.div
                              key={item.id}
                              layout
                              className="bg-white rounded-ios-xl border border-gray-200 shadow-ios-card overflow-hidden hover:shadow-lg transition-shadow"
                            >
                              {/* Header */}
                              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <span className="text-lg font-bold text-white">{item.symbol?.[0] || 'M'}</span>
                                  </div>
                                  <div>
                                    <p className="font-bold text-white font-ios-display">{item.name}</p>
                                    <p className="text-xs text-blue-100 font-medium">{item.symbol || 'MARKET'}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-blue-100 uppercase tracking-wide">ROI Total</p>
                                  <p className="text-lg font-bold text-white">+{item.profitPercentage.toFixed(2)}%</p>
                                </div>
                              </div>

                              {/* Body */}
                              <div className="p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-gray-50 rounded-ios-xl p-3 border border-gray-200">
                                    <p className="text-xs text-text-tertiary uppercase tracking-wide font-semibold">{t('ticketDrawer.labels.investment')}</p>
                                    <p className="text-lg font-bold text-text-primary font-ios-display">${item.invested.toFixed(2)}</p>
                                  </div>
                                  <div className="bg-green-50 rounded-ios-xl p-3 border border-green-200">
                                    <p className="text-xs text-green-700 uppercase tracking-wide font-semibold">{t('ticketDrawer.labels.daily')}</p>
                                    <p className="text-lg font-bold text-ios-green font-ios-display">+${item.daily.toFixed(2)}</p>
                                  </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-ios-xl p-3 border border-blue-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">{t('ticketDrawer.market.expectedReturn')}</span>
                                    <span className="text-xs text-blue-600 font-semibold">{item.duration} {t('ticketDrawer.labels.days')}</span>
                                  </div>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-blue-900 font-ios-display">
                                      ${(item.invested + item.expectedReturn).toFixed(2)}
                                    </span>
                                    <span className="text-sm text-blue-600 font-medium">
                                      (+${item.expectedReturn.toFixed(2)})
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-text-tertiary pt-2 border-t border-gray-200">
                                  <span className="flex items-center gap-1 font-medium">
                                    <FiClock className="w-3 h-3" />
                                    {t('ticketDrawer.labels.purchaseDate')}
                                  </span>
                                  <span className="font-semibold">
                                    {new Date(item.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'en' ? 'en-US' : 'es-ES', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </section>
              )}

              {/* Quantitative Tab - Planes cuantitativos */}
              {activeTab === 'quantitative' && (
                <section className="px-5 py-4 space-y-4">
                  {isLoadingTransactions ? (
                    <div className="py-10"><Loader text={t('ticketDrawer.loaders.quantitative')} /></div>
                  ) : (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-ios-xl bg-gradient-to-br from-purple-50 to-purple-100/80 border border-purple-200/50 p-4 shadow-ios-card">
                          <p className="text-xs text-purple-700 uppercase tracking-wide font-bold flex items-center gap-1">
                            <FiZap className="w-3 h-3" />
                            {t('ticketDrawer.quant.totalCapital')}
                          </p>
                          <p className="text-2xl font-bold text-purple-900 font-ios-display mt-1">
                            ${investmentSummaries.quantitativePurchases.reduce((acc, item) => acc + (item.invested || 0), 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-purple-600 mt-1 font-medium">
                            {investmentSummaries.quantitativePurchases.length} {t('ticketDrawer.quant.plans')}
                          </p>
                        </div>
                        <div className="rounded-ios-xl bg-gradient-to-br from-green-50 to-ios-green/10 border border-ios-green/20 p-4 shadow-ios-card">
                          <p className="text-xs text-ios-green uppercase tracking-wide font-bold flex items-center gap-1">
                            <FiDollarSign className="w-3 h-3" />
                            {t('ticketDrawer.quant.dailyProfit')}
                          </p>
                          <p className="text-2xl font-bold text-ios-green font-ios-display mt-1">
                            ${(user?.activeInvestments?.filter(inv => inv.type === 'quantitative').reduce((acc, inv) => acc + (inv.dailyProfitAmount || 0), 0) || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-ios-green/80 mt-1 font-medium">
                            {t('ticketDrawer.quant.toWithdrawable')}
                          </p>
                        </div>
                      </div>

                      {/* Quantitative Items */}
                      {investmentSummaries.quantitativePurchases.length === 0 ? (
                        <div className="p-8 bg-white rounded-ios-xl text-center border border-gray-200 shadow-ios-card">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                            <FiZap className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="font-semibold text-text-primary mb-1">{t('ticketDrawer.quant.emptyTitle')}</p>
                          <p className="text-xs text-text-tertiary">{t('ticketDrawer.quant.emptySubtitle')}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {investmentSummaries.quantitativePurchases.map((item) => {
                            // Buscar la inversión activa correspondiente
                            const activeInv = user?.activeInvestments?.find(
                              inv => inv.type === 'quantitative' && 
                              Math.abs(inv.amount - item.invested) < 0.01
                            );

                            return (
                              <motion.div
                                key={item.id}
                                layout
                                className="bg-white rounded-ios-xl border border-gray-200 shadow-ios-card overflow-hidden hover:shadow-lg transition-shadow"
                              >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                      <FiZap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-white font-ios-display">{item.name}</p>
                                      <p className="text-xs text-purple-100 font-medium">{t('ticketDrawer.quant.planLabel')}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-purple-100 uppercase tracking-wide">ROI Total</p>
                                    <p className="text-lg font-bold text-white">+{item.profitPercentage.toFixed(2)}%</p>
                                  </div>
                                </div>

                                {/* Body */}
                                <div className="p-4 space-y-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-ios-xl p-3 border border-gray-200">
                                      <p className="text-xs text-text-tertiary uppercase tracking-wide font-semibold">{t('ticketDrawer.labels.investment')}</p>
                                      <p className="text-lg font-bold text-text-primary font-ios-display">${item.invested.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-purple-50 rounded-ios-xl p-3 border border-purple-200">
                                      <p className="text-xs text-purple-700 uppercase tracking-wide font-semibold">{t('ticketDrawer.labels.daily')}</p>
                                      <p className="text-lg font-bold text-purple-600 font-ios-display">
                                        {activeInv?.dailyProfitAmount 
                                          ? `+$${activeInv.dailyProfitAmount.toFixed(2)}`
                                          : `+$${((item.invested * item.profitPercentage / 100) / (item.duration || 1)).toFixed(2)}`
                                        }
                                      </p>
                                    </div>
                                  </div>

                                  {activeInv?.accruedProfit && activeInv.accruedProfit > 0 && (
                                    <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-ios-xl p-3 border border-green-200">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-green-700 uppercase tracking-wide flex items-center gap-1">
                                          <FiCheckCircle className="w-3 h-3" />
                                          {t('ticketDrawer.quant.accruedProfit')}
                                        </span>
                                        <span className="text-xl font-bold text-ios-green font-ios-display">
                                          +${activeInv.accruedProfit.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {item.duration > 0 && (
                                    <div className="bg-blue-50 rounded-ios-xl p-3 border border-blue-200">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">{t('ticketDrawer.labels.duration')}</span>
                                        <span className="text-sm font-bold text-blue-900">{item.duration} {t('ticketDrawer.labels.days')}</span>
                                      </div>
                                      {activeInv?.endDate && (
                                        <p className="text-xs text-blue-600 font-medium">
                                          {t('ticketDrawer.labels.endsAt')}: {new Date(activeInv.endDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'en' ? 'en-US' : 'es-ES')}
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between text-xs text-text-tertiary pt-2 border-t border-gray-200">
                                    <span className="flex items-center gap-1 font-medium">
                                      <FiClock className="w-3 h-3" />
                                      {t('ticketDrawer.labels.purchaseDate')}
                                    </span>
                                    <span className="font-semibold">
                                      {new Date(item.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'en' ? 'en-US' : 'es-ES', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
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