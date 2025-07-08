// frontend/src/pages/ToolsPage.jsx (VERSIÓN CORREGIDA SEGÚN NUEVA REGLA)
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

// --- INICIO DE NUEVA LÓGICA ---
// Definimos los nombres de los niveles que NO se bloquean.
// Es mejor usar los nombres exactos o un identificador único si lo tienes.
// Usaré los nombres que mencionaste: "VIP 4" y "VIP 5".
const UNLOCKABLE_TOOL_NAMES = ["VIP 4", "VIP 5"]; 
// --- FIN DE NUEVA LÓGICA ---


const ToolsPage = () => {
  const { t } = useTranslation();
  const { tools, loading, error, fetchTools } = useToolsStore();
  const { user } = useUserStore();

  const [selectedTool, setSelectedTool] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [modalStep, setModalStep] = useState('none');
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  // --- INICIO DE LÓGICA REVISADA ---
  const { ownedToolIds, toolCounts } = useMemo(() => {
    if (!user || !user.tools || user.tools.length === 0) {
      return { ownedToolIds: new Set(), toolCounts: {} };
    }

    const ids = new Set();
    const counts = {};

    user.tools.forEach(tool => {
      ids.add(tool._id);
      counts[tool._id] = (counts[tool._id] || 0) + 1;
    });

    return { ownedToolIds: ids, toolCounts: counts };
  }, [user]);
  // --- FIN DE LÓGICA REVISADA ---


  const handleBuyClick = (tool) => {
    setSelectedTool(tool);
    setModalStep('purchase_options');
  };

  const handleCloseAllModals = () => {
    setSelectedTool(null);
    setModalStep('none');
    setPaymentInfo(null);
  };

  const handleCryptoCurrencySelect = async (currency) => {
    // ... (sin cambios aquí)
    setIsProcessingPayment(true);
    try {
      const response = await api.post('/wallet/create-direct-deposit', {
        toolId: selectedTool._id,
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
              // --- LÓGICA DE BLOQUEO REVISADA ---
              const hasBeenPurchased = ownedToolIds.has(tool._id);
              const isUnlockable = UNLOCKABLE_TOOL_NAMES.includes(tool.name);
              
              const isLocked = hasBeenPurchased && !isUnlockable;
              const ownedCount = toolCounts[tool._id] || 0;
              // --- FIN LÓGICA DE BLOQUEO REVISADA ---

              return (
                <motion.div key={tool._id} variants={itemVariants}>
                  <ToolCard 
                    tool={tool} 
                    onBuyClick={handleBuyClick}
                    ownedCount={ownedCount} // Mantenemos el contador, es útil
                    isLocked={isLocked}     // Prop de bloqueo con la nueva lógica
                  />
                </motion.div>
              );
            })}
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