// RUTA: frontend/src/pages/MarketPage.jsx (VERSIÓN FINAL Y CONSISTENTE)

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useInvestmentStore from '@/store/investmentStore';
import useUserStore from '@/store/userStore';
import InvestmentModal from '@/components/market/InvestmentModal';
import { CryptoIcon } from '@/components/icons/CryptoIcons';
import { FiChevronDown } from 'react-icons/fi';

const MarketItemCard = ({ item, onPurchaseClick, onToggleDetails, isExpanded }) => {
  const dailyProfit = item.dailyProfitPercentage !== undefined ? item.dailyProfitPercentage.toFixed(2) : 'N/A';

  return (
    <motion.div
      layout
      className="bg-internal-card rounded-ios-xl shadow-ios-card overflow-hidden"
      transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <CryptoIcon symbol={item.symbol} className="w-8 h-8 text-text-primary" />
            </div>
            <div>
              <h3 className="font-ios-display font-bold text-lg text-text-primary">{item.name}</h3>
              <p className="font-ios text-text-secondary">{item.symbol}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-ios-display font-bold text-xl text-ios-green">
              +{dailyProfit}%
            </p>
            <p className="font-ios text-sm text-text-secondary">Ganancia Diaria</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 border-t border-system-secondary">
        <button
          onClick={onToggleDetails}
          className="flex items-center justify-center gap-2 py-3 text-sm font-ios font-semibold text-text-secondary hover:bg-gray-50 transition-colors"
        >
          <span>Detalles</span>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <FiChevronDown />
          </motion.div>
        </button>
        <button
          onClick={() => onPurchaseClick(item)}
          className="py-3 text-sm font-ios font-semibold bg-ios-green text-white hover:bg-ios-green/90 transition-colors"
        >
          Comprar
        </button>
      </div>
    </motion.div>
  );
};

const MarketPage = () => {
  const { investmentPackages, isLoading, error, fetchInvestmentPackages } = useInvestmentStore();
  const { user } = useUserStore();
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);

  useEffect(() => {
    // Solo llama a fetch si no hay paquetes cargados para evitar recargas innecesarias
    if (investmentPackages.length === 0) {
      fetchInvestmentPackages();
    }
  }, [investmentPackages.length, fetchInvestmentPackages]);

  const handlePurchaseClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => setIsModalOpen(false);
  const handleToggleDetails = (itemId) => setExpandedCardId(prevId => (prevId === itemId ? null : itemId));

  const renderContent = () => {
    if (isLoading && investmentPackages.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ios-green mx-auto"></div>
        </div>
      );
    }

    if (error && investmentPackages.length === 0) {
      return (
        <div className="text-center py-20 text-text-secondary">
          <p>{error}</p>
          <button onClick={fetchInvestmentPackages} className="mt-4 text-ios-green font-semibold">Reintentar</button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {investmentPackages.map((item) => (
          <MarketItemCard
            key={item._id}
            item={item}
            onPurchaseClick={handlePurchaseClick}
            onToggleDetails={() => handleToggleDetails(item._id)}
            isExpanded={expandedCardId === item._id}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-system-background pb-24">
      <div className="p-4 pt-6">
        <h1 className="text-3xl font-ios-display font-bold text-text-primary mb-6">
          Mercado de Inversión
        </h1>
        {renderContent()}
      </div>
      
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <InvestmentModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            item={selectedItem}
            userBalance={user?.balance?.usdt || 0}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketPage;