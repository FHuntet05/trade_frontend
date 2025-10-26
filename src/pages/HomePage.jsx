// RUTA: src/pages/HomePage.jsx
// --- VERSIÓN FINAL RESILIENTE USANDO EL MARKETSTORE ---

import React, { useEffect } from 'react'; // Se elimina useState
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/userStore';
import useMarketStore from '@/store/marketStore'; // 1. Se importa el nuevo store.

import { IOSHeader } from '@/components/ui/ios/Header';
import { CryptoList } from '@/components/ui/ios/CryptoList';
import { FiGift, FiMessageSquare } from 'react-icons/fi';
import { formatters } from '@/utils/formatters';
import useCountdown from '@/hooks/useCountdown';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  
  // 2. Se obtienen el estado y la acción directamente del store.
  const { marketData, isLoading, fetchMarketData } = useMarketStore();

  // 3. El useEffect ahora solo necesita llamar a la acción del store.
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  // La lógica del countdown y de navegación se mantiene intacta.
  const targetEndDate = user?.activeInvestments?.[0]?.endDate;
  const { timeLeft, isFinished } = useCountdown(targetEndDate);
  const handleDeposit = () => navigate('/deposit');
  const handleClaimBonus = () => navigate('/bonus');
  const handleSupport = () => navigate('/support');
  
  const userBalance = user?.balance?.usdt || 0;
  const withdrawableBalance = user?.withdrawableBalance || 0;

  return (
    <div className="min-h-screen bg-system-background">
      <IOSHeader 
        balance={userBalance}
        onDeposit={handleDeposit}
      />

      <div className="p-4 space-y-4">
        {/* La UI no necesita cambios */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleClaimBonus} className="bg-internal-card p-3 rounded-ios-card shadow-ios-card flex items-center space-x-3">
            <FiGift className="w-6 h-6 text-ios-green" />
            <span className="text-sm font-ios font-medium text-text-primary">{t('home.claimBonus')}</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleSupport} className="bg-internal-card p-3 rounded-ios-card shadow-ios-card flex items-center space-x-3">
            <FiMessageSquare className="w-6 h-6 text-ios-green" />
            <span className="text-sm font-ios font-medium text-text-primary">{t('home.support')}</span>
          </motion.button>
        </div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-internal-card rounded-ios-card p-4 shadow-ios-card text-center">
          <p className="text-text-secondary text-sm mb-1 font-ios">{t('home.availableWithdrawal')}</p>
          <p className="text-3xl font-ios-display font-bold text-text-primary mb-3">
            {formatters.formatCurrency(withdrawableBalance)}
          </p>
          <div className="bg-system-secondary rounded-ios p-3 inline-flex items-center justify-center">
            {isFinished ? (
              <p className="text-text-secondary text-sm font-ios">Realiza una inversión para ver tus ganancias</p>
            ) : (
              <p className="text-text-secondary text-sm font-ios">
                ⏰ {t('home.nextProfitIn')} <span className="font-semibold text-text-primary">{timeLeft}</span>
              </p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="mt-4 pb-24">
        <div className="px-4 mb-3">
          <h2 className="font-ios-display text-xl font-bold text-text-primary">Mercado en Vivo</h2>
        </div>
        {/* 4. CryptoList ahora muestra el mensaje de error solo si la carga inicial falla y no hay datos en caché. */}
        {isLoading && marketData.length === 0 ? (
          <p className="px-4 text-text-secondary">Cargando datos del mercado...</p>
        ) : !isLoading && marketData.length === 0 ? (
          <p className="px-4 text-text-secondary">No se pudieron cargar los datos del mercado.</p>
        ) : (
          <CryptoList cryptos={marketData} />
        )}
      </div>
    </div>
  );
};

export default HomePage;