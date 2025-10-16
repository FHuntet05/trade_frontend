// RUTA: frontend/src/pages/MarketPage.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useMarketStore from '@/store/marketStore';
import useUserStore from '@/store/userStore';
import InvestmentModal from '@/components/market/InvestmentModal';
import { CryptoIcon } from '@/components/icons/CryptoIcons';
import { FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MarketItemCard = ({ item, onPurchaseClick, onToggleDetails, isExpanded }) => {
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
              +{item.dailyProfitPercentage.toFixed(2)}%
            </p>
            <p className="font-ios text-sm text-text-secondary">Ganancia Diaria</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <p className="font-ios text-text-secondary">Duración</p>
            <p className="font-ios font-semibold text-text-primary">{item.durationDays} Días</p>
          </div>
          <div>
            <p className="font-ios text-text-secondary">Inversión</p>
            <p className="font-ios font-semibold text-text-primary">
              {item.minInvestment} - {item.maxInvestment} USDT
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="px-4 pb-4 border-t border-system-secondary"
          >
            <p className="font-ios text-text-secondary mt-3 text-sm">{item.description}</p>
          </motion.div>
        )}
      </AnimatePresence>

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
  const { t } = useTranslation();
  const { marketItems, isLoading, error, fetchMarketItems } = useMarketStore();
  const { user } = useUserStore();
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);

  useEffect(() => {
    fetchMarketItems();
  }, [fetchMarketItems]);

  const handlePurchaseClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };
  
  const handleToggleDetails = (itemId) => {
    setExpandedCardId(prevId => (prevId === itemId ? null : itemId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-system-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-system-background flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-lg font-bold text-red-500">Error</h2>
        <p className="text-text-secondary">{error}</p>
        <button onClick={fetchMarketItems} className="mt-4 bg-ios-green text-white px-4 py-2 rounded-ios">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-system-background pb-24">
      <div className="p-4 pt-6">
        <h1 className="text-3xl font-ios-display font-bold text-text-primary mb-6">
          {t('market.title')}
        </h1>
        <div className="space-y-4">
          {marketItems.map((item) => (
            <MarketItemCard
              key={item._id}
              item={item}
              onPurchaseClick={handlePurchaseClick}
              onToggleDetails={() => handleToggleDetails(item._id)}
              isExpanded={expandedCardId === item._id}
            />
          ))}
        </div>
      </div>
      
      <AnimatePresence>
        {selectedItem && (
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