// frontend/src/pages/FinancialHistoryPage.jsx (v1.1 - i18n)
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';
import TransactionItem from '../components/history/TransactionItem';
import Loader from '../components/common/Loader';
import StaticPageLayout from '../components/layout/StaticPageLayout';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };

const FinancialHistoryPage = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get('/wallet/history');
        setTransactions(response.data);
      } catch (err) {
        setError(t('historyPage.error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [t]);

  return (
    <StaticPageLayout title={t('historyPage.title')}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader" className="flex justify-center items-center h-full"><Loader text={t('historyPage.loading')} /></motion.div>
        ) : error ? (
          <motion.div key="error" className="text-center text-red-400 pt-16">{error}</motion.div>
        ) : transactions.length === 0 ? (
          <motion.div key="empty" className="text-center text-text-secondary pt-16">{t('historyPage.empty')}</motion.div>
        ) : (
          <motion.div key="list" className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
            {transactions.map((tx) => (<TransactionItem key={tx._id} transaction={tx} />))}
          </motion.div>
        )}
      </AnimatePresence>
    </StaticPageLayout>
  );
};
export default FinancialHistoryPage;