// RUTA: src/pages/HomePage.jsx

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserStore, usePriceStore } from '@/store';
import { IOSHeader } from '@/components/ui/ios/Header';
import { CryptoList } from '@/components/ui/ios/CryptoList';
import { FiGift, FiMessageSquare } from 'react-icons/fi';
import { formatters } from '@/utils/formatters';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { prices, fetchPrices } = usePriceStore(); // Usamos fetchPrices en lugar de la simulación

  useEffect(() => {
    // Usamos fetchPrices que tiene la lógica de caché de 3 minutos
    const interval = setInterval(() => {
      fetchPrices();
    }, 60000); // Podemos llamarlo cada minuto, la caché interna lo protegerá
    fetchPrices(); // Llamada inicial

    return () => clearInterval(interval);
  }, [fetchPrices]);

  const handleDeposit = () => navigate('/deposit');
  const handleClaimBonus = () => navigate('/bonus');
  const handleSupport = () => navigate('/support');
  const handleViewMarket = () => navigate('/market');

  const topCryptos = [
    { name: 'Bitcoin', symbol: 'BTC', price: prices.BTC || 0, change: 2.4 },
    { name: 'Ethereum', symbol: 'ETH', price: prices.ETH || 0, change: 1.8 },
    { name: 'BNB', symbol: 'BNB', price: prices.BNB || 0, change: -0.5 },
    { name: 'Solana', symbol: 'SOL', price: prices.SOL || 0, change: 5.2 },
    { name: 'Tether', symbol: 'USDT', price: prices.USDT || 1.00, change: 0.0 },
  ];
  
  // --- INICIO DE LA CORRECCIÓN CRÍTICA ---
  // Accedemos de forma segura al balance del usuario.
  const userBalance = user?.balance?.usdt || 0;
  // --- FIN DE LA CORRECCIÓN CRÍTICA ---

  return (
    <div className="min-h-screen bg-system-background">
      <IOSHeader 
        balance={userBalance}
        onDeposit={handleDeposit}
      />

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleClaimBonus}
            className="bg-internal-card p-3 rounded-ios-card shadow-ios-card flex items-center space-x-3"
          >
            <FiGift className="w-6 h-6 text-ios-green" />
            <span className="text-sm font-ios font-medium text-text-primary">{t('home.claimBonus')}</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSupport}
            className="bg-internal-card p-3 rounded-ios-card shadow-ios-card flex items-center space-x-3"
          >
            <FiMessageSquare className="w-6 h-6 text-ios-green" />
            <span className="text-sm font-ios font-medium text-text-primary">{t('home.support')}</span>
          </motion.button>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-internal-card rounded-ios-card p-4 shadow-ios-card text-center"
        >
          <p className="text-text-secondary text-sm mb-1 font-ios">{t('home.availableWithdrawal')}</p>
          <p className="text-3xl font-ios-display font-bold text-text-primary mb-3">
            {formatters.formatCurrency(userBalance)}
          </p>
          <div className="bg-system-secondary rounded-ios p-3 inline-flex items-center justify-center">
            <p className="text-text-secondary text-sm font-ios">
              ⏰ {t('home.nextProfitIn')} <span className="font-semibold text-text-primary">23:39:42</span>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="mt-4 pb-24">
        <div className="flex justify-between items-center px-4 mb-3">
          <h2 className="font-ios-display text-xl font-bold text-text-primary">
            {t('home.marketWidgetTitle')}
          </h2>
          <button 
            className="text-ios-green font-ios font-semibold"
            onClick={handleViewMarket}
          >
            {t('common.seeMore')}
          </button>
        </div>
        <CryptoList cryptos={topCryptos} />
      </div>
    </div>
  );
};

export default HomePage;