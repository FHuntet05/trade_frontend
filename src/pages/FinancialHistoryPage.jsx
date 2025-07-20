// frontend/src/pages/FinancialHistoryPage.jsx (VERSIÓN ACTUALIZADA)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiChevronLeft } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';
import TransactionItem from '../components/history/TransactionItem'; // <-- Asegúrate de que esta ruta sea correcta
import Loader from '../components/common/Loader';
import StaticPageLayout from '../components/layout/StaticPageLayout';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const FinancialHistoryPage = () => {
  const navigate = useNavigate();
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
        setError('No se pudo cargar el historial.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    // --- INICIO DE LA MODIFICACIÓN ---
    // Envolvemos todo el contenido con StaticPageLayout, pasándole el título.
    <StaticPageLayout title="Historial de Registros">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader" className="flex justify-center items-center h-full">
            <Loader text="Cargando historial..." />
          </motion.div>
        ) : error ? (
          <motion.div key="error" className="text-center text-red-400 pt-16">{error}</motion.div>
        ) : transactions.length === 0 ? (
          <motion.div key="empty" className="text-center text-text-secondary pt-16">
            No tienes transacciones todavía.
          </motion.div>
        ) : (
          <motion.div
            key="list"
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {transactions.map((tx) => (
              <TransactionItem key={tx._id} transaction={tx} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </StaticPageLayout>
    // --- FIN DE LA MODIFICACIÓN ---
  );
};

export default FinancialHistoryPage;