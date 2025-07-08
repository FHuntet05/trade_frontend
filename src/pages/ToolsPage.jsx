import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useToolsStore from '../store/toolsStore';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

import ToolCard from '../components/tools/ToolCard';
import Loader from '../components/common/Loader';
import PurchaseFlowModal from '../components/tools/PurchaseModal';
import CryptoCurrencySelectionModal from '../components/modals/CryptoCurrencySelectionModal';
import DirectDepositModal from '../components/modals/DirectDepositModal';

import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120 } },
};

const SINGLE_PURCHASE_TOOL_NAMES = ["VIP 1", "VIP 2", "VIP 3"];


const ToolsPage = () => {
  const { t } = useTranslation();
  const { tools, loading, error, fetchTools } = useToolsStore();
  const { user } = useUserStore();

  const [selectedTool, setSelectedTool] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [modalStep, setModalStep] = useState('none');
  const [paymentInfo, setPaymentInfo] = useState(null);
  // <<< NUEVO ESTADO: Para almacenar la cantidad de la compra
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const { ownedToolIds, toolCounts } = useMemo(() => {
    if (!user || !user.activeTools || user.activeTools.length === 0) {
      return { ownedToolIds: new Set(), toolCounts: {} };
    }
    const ids = new Set();
    const counts = {};
    user.activeTools.forEach(toolPurchase => {
      if (toolPurchase.tool && toolPurchase.tool._id) {
          const toolId = toolPurchase.tool._id;
          ids.add(toolId);
          counts[toolId] = (counts[toolId] || 0) + 1;
      }
    });
    return { ownedToolIds: ids, toolCounts: counts };
  }, [user]);


  const handleBuyClick = (tool) => {
    setSelectedTool(tool);
    setModalStep('purchase_options');
    setPurchaseQuantity(1); // <<< Resetear la cantidad al iniciar una nueva compra
  };

  const handleCloseAllModals = () => {
    setSelectedTool(null);
    setModalStep('none');
    setPaymentInfo(null);
    setPurchaseQuantity(1); // <<< Resetear la cantidad al cerrar
  };
  
  // <<< NUEVA FUNCIÓN: Maneja la transición del primer al segundo modal
  const handleProceedToCryptoSelection = (quantity) => {
    setPurchaseQuantity(quantity); // Guardamos la cantidad seleccionada
    setModalStep('select_crypto'); // Pasamos al siguiente modal
  };

  // <<< FUNCIÓN ACTUALIZADA: Envía la cantidad a la API
  const handleCryptoCurrencySelect = async (currency) => {
    setIsProcessingPayment(true);
    try {
      const response = await api.post('/wallet/create-direct-deposit', {
        toolId: selectedTool._id,
        quantity: purchaseQuantity, // <<< Usamos la cantidad guardada en el estado
        currency: currency,
      });
      setPaymentInfo(response.data);
      setModalStep('show_deposit');
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
            {tools.map(tool => {
              const hasBeenPurchased = ownedToolIds.has(tool._id);
              const isSinglePurchase = SINGLE_PURCHASE_TOOL_NAMES.includes(tool.name);
              const isLocked = hasBeenPurchased && isSinglePurchase;
              const ownedCount = toolCounts[tool._id] || 0;

              return (
                <motion.div key={tool._id} variants={itemVariants}>
                  <ToolCard 
                    tool={tool} 
                    onBuyClick={handleBuyClick}
                    ownedCount={ownedCount}
                    isLocked={isLocked}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Gestión de modales actualizada --- */}
      <AnimatePresence>
        {modalStep === 'purchase_options' && selectedTool && (
          <PurchaseFlowModal 
            tool={selectedTool}
            onClose={handleCloseAllModals}
            // <<< Pasamos la nueva función que recibe la cantidad
            onSelectCrypto={handleProceedToCryptoSelection} 
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