// frontend/src/pages/ToolsPage.jsx (VERSIÓN FINAL CON NUEVO FLUJO DE PAGO)
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useToolsStore from '../store/toolsStore';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

import ToolCard from '../components/tools/ToolCard';
import Loader from '../components/common/Loader';
import PurchaseFlowModal from '../components/tools/PurchaseModal'; // Modal para compra con saldo
import CryptoCurrencySelectionModal from '../components/modals/CryptoCurrencySelectionModal'; // 1er Modal del nuevo flujo
import DirectDepositModal from '../components/modals/DirectDepositModal'; // 2do Modal del nuevo flujo

import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120 } },
};

const ToolsPage = () => {
  const { t } = useTranslation();
  const { tools, loading, error, fetchTools } = useToolsStore();
  const { user } = useUserStore();

  const [selectedTool, setSelectedTool] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Estados para el flujo de compra
  const [modalStep, setModalStep] = useState('none'); // none, purchase_options, select_crypto, show_deposit
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const handleBuyClick = (tool) => {
    setSelectedTool(tool);
    setModalStep('purchase_options'); // Abre el modal de opciones de compra
  };

  const handleCloseAllModals = () => {
    setSelectedTool(null);
    setModalStep('none');
    setPaymentInfo(null);
  };

  // Esta función se llama desde el modal de selección de moneda
  const handleCryptoCurrencySelect = async (currency) => {
    setIsProcessingPayment(true);
    try {
      const response = await api.post('/wallet/create-direct-deposit', {
        toolId: selectedTool._id,
        currency: currency,
      });
      setPaymentInfo(response.data);
      setModalStep('show_deposit'); // Avanza al siguiente modal
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo generar la dirección de pago.');
      handleCloseAllModals();
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{t('tools.title')}</h1>
        <p className="text-text-secondary">{t('tools.subtitle')}</p>
      </div>
      
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader"><Loader text={t('tools.loading')} /></motion.div>
        ) : error ? (
           <motion.div key="error" className="text-center text-red-400 pt-16">{error}</motion.div>
        ) : (
          <motion.div
            key="tools-list"
            className="grid grid-cols-1 gap-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {tools.map(tool => (
              <motion.div key={tool._id} variants={itemVariants}>
                <ToolCard tool={tool} onBuyClick={handleBuyClick} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- GESTIÓN DE MODALES CON EL NUEVO SISTEMA DE PASOS --- */}
      <AnimatePresence>
        {modalStep === 'purchase_options' && selectedTool && (
          <PurchaseFlowModal 
            tool={selectedTool}
            onClose={handleCloseAllModals}
            onSelectCrypto={() => setModalStep('select_crypto')} // <-- Va al modal de selección
          />
        )}

        {modalStep === 'select_crypto' && (
          <CryptoCurrencySelectionModal
            isLoading={isProcessingPayment}
            onClose={handleCloseAllModals}
            onSelect={handleCryptoCurrencySelect}
          />
        )}

        {modalStep === 'show_deposit' && paymentInfo && (
          <DirectDepositModal
            paymentInfo={paymentInfo}
            onClose={handleCloseAllModals}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolsPage;