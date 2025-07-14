// src/pages/ToolsPage.jsx (COMPLETO, SIN TOAST Y CON LÓGICA DE PRECIOS CORRECTA)
import React, { useState, useEffect, useMemo } from 'react';
import useToolsStore from '../store/toolsStore';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import UserInfoHeader from '../components/home/UserInfoHeader';
import ToolCard from '../components/tools/ToolCard';
import Loader from '../components/common/Loader';
import PurchaseFlowModal from '../components/tools/PurchaseModal';
import CryptoCurrencySelectionModal from '../components/modals/CryptoCurrencySelectionModal';
import DirectDepositModal from '../components/modals/DirectDepositModal';

const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
const SINGLE_PURCHASE_TOOL_NAMES = ["VIP 1", "VIP 2", "VIP 3"];

const StatCard = ({ label, value }) => (
  <div className="bg-dark-secondary p-3 rounded-lg border border-white/10 text-center">
    <p className="text-xs text-text-secondary">{label}</p>
    <p className="font-bold text-white text-lg">{value}</p>
  </div>
);

const ToolsPage = () => {
  const { tools, loading, error, fetchTools } = useToolsStore();
  const { user } = useUserStore();
  
  const [activeTab, setActiveTab] = useState('all_tools');
  const [selectedTool, setSelectedTool] = useState(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isCryptoSelectionModalOpen, setIsCryptoSelectionModalOpen] = useState(false);
  const [isDirectDepositModalOpen, setIsDirectDepositModalOpen] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [purchaseContext, setPurchaseContext] = useState({ quantity: 1, totalCost: 0 });
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [cryptoPrices, setCryptoPrices] = useState(null);

  useEffect(() => { fetchTools(); }, [fetchTools]);

  const { ownedTools, toolCounts } = useMemo(() => {
    if (!user || !user.activeTools) return { ownedTools: [], toolCounts: {} };
    const counts = {};
    user.activeTools.forEach(purchase => {
        if (purchase.tool?._id) {
            counts[purchase.tool._id] = (counts[purchase.tool._id] || 0) + 1;
        }
    });
    const owned = user.activeTools.map(purchase => purchase.tool).filter(Boolean);
    return { ownedTools: owned, toolCounts: counts };
  }, [user]);

  const handleBuyClick = (tool) => {
    setSelectedTool(tool);
    setIsPurchaseModalOpen(true);
  };
  
  const handleCloseAllModals = () => {
    setIsPurchaseModalOpen(false);
    setIsCryptoSelectionModalOpen(false);
    setIsDirectDepositModalOpen(false);
    setSelectedTool(null);
    setPaymentDetails(null);
    setCryptoPrices(null);
  };

  const handleStartCryptoPayment = async (quantity) => {
    if (!selectedTool) return;
    const totalCost = selectedTool.price * quantity;
    setPurchaseContext({ quantity, totalCost });
    
    setIsLoadingPayment(true);
    // El toast ha sido eliminado. El estado `isLoadingPayment` se pasa al modal.
    try {
      const response = await api.get('/payment/prices');
      setCryptoPrices(response.data);
      setIsPurchaseModalOpen(false);
      setIsCryptoSelectionModalOpen(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "No se pudieron obtener los precios.";
      toast.error(errorMessage);
    } finally {
      setIsLoadingPayment(false);
    }
  };
  
  const handleCurrencySelected = async (selectedCurrency) => {
    setIsLoadingPayment(true);
    try {
      const response = await api.post('/payment/generate-address', { 
          chain: selectedCurrency.chain, 
      });
      const { address } = response.data;

      let amountToSend = purchaseContext.totalCost;
      const price = cryptoPrices[selectedCurrency.currency];

      if (selectedCurrency.currency !== 'USDT' && price) {
        amountToSend = purchaseContext.totalCost / price;
      }
      
      setPaymentDetails({
          paymentAddress: address,
          paymentAmount: amountToSend.toFixed(8),
          currency: `${selectedCurrency.currency} (${selectedCurrency.chain})`
      });
      
      setIsCryptoSelectionModalOpen(false);
      setIsDirectDepositModalOpen(true);

    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al generar la dirección de pago.';
        toast.error(errorMessage);
        console.error("Error en handleCurrencySelected:", error);
    } finally {
        setIsLoadingPayment(false);
    }
  };

  const TabButton = ({ tabName, label, badgeCount }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`relative flex-1 py-3 text-sm font-semibold transition-colors ${
        activeTab === tabName ? 'text-white' : 'text-text-secondary'
      }`}
    >
      {label}
      {badgeCount > 0 && <span className="absolute top-1 right-2 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">{badgeCount}</span>}
      {activeTab === tabName && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-start" layoutId="underline" />}
    </button>
  );

  const dailyMiningRate = user?.effectiveMiningRate || 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 p-4 space-y-5">
      <UserInfoHeader />
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Horas de trabajo" value="24H" />
        <StatCard label="Velocidad de minería" value={`${dailyMiningRate.toFixed(2)} NTX/Día`} />
      </div>
      <div className="bg-dark-secondary rounded-lg border border-white/10 flex">
        <TabButton tabName="all_tools" label="Herramientas de minería" badgeCount={tools.length} />
        <TabButton tabName="my_tools" label="Mejora" />
      </div>
      <div className="flex justify-end">
        <button className="text-xs text-text-secondary hover:text-white">Historial de compras</button>
      </div>
      <AnimatePresence mode="wait">
        {loading ? ( <motion.div key="loader"><Loader /></motion.div> ) 
        : error ? ( <motion.div key="error" className="text-center text-red-400">{error}</motion.div> ) 
        : (
          <div className="space-y-5">
            {activeTab === 'all_tools' && tools.map(tool => {
                const ownedCount = toolCounts[tool._id] || 0;
                const isLocked = SINGLE_PURCHASE_TOOL_NAMES.includes(tool.name) && ownedCount > 0;
                return (
                  <motion.div key={tool._id} variants={itemVariants} initial="hidden" animate="visible">
                    <ToolCard tool={tool} onBuyClick={handleBuyClick} ownedCount={ownedCount} isLocked={isLocked}/>
                  </motion.div>
                );
            })}
            {activeTab === 'my_tools' && (
              ownedTools.length > 0 ? ownedTools.map((tool, index) => (
                <motion.div key={`${tool._id}-${index}`} variants={itemVariants} initial="hidden" animate="visible">
                  <ToolCard tool={tool} onBuyClick={() => {}} ownedCount={1} isLocked={true}/>
                </motion.div>
              )) : ( <p className="text-center text-text-secondary pt-8">No tienes herramientas activas.</p> )
            )}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPurchaseModalOpen && selectedTool && (
          <PurchaseFlowModal 
            tool={selectedTool} 
            onClose={handleCloseAllModals} 
            onSelectCrypto={handleStartCryptoPayment}
          />
        )}
        {isCryptoSelectionModalOpen && (
            <CryptoCurrencySelectionModal
                isLoading={isLoadingPayment}
                onSelect={handleCurrencySelected}
                onClose={handleCloseAllModals}
            />
        )}
        {isDirectDepositModalOpen && paymentDetails && (
            <DirectDepositModal
                paymentInfo={paymentDetails}
                onClose={handleCloseAllModals}
            />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolsPage;