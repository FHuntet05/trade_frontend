// RUTA: src/pages/HomePage.jsx
// --- VERSIÓN ACTUALIZADA CON LÓGICA DE BONO DIARIO Y CONTADOR ---

import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/userStore';
import useMarketStore from '@/store/marketStore';
import { IOSHeader } from '@/components/ui/ios/Header';
import { CryptoList } from '@/components/ui/ios/CryptoList';
import { FiGift, FiMessageSquare } from 'react-icons/fi';
import { formatters } from '@/utils/formatters';
import useCountdown from '@/hooks/useCountdown';
import toast from 'react-hot-toast'; // --- INICIO DE LA MODIFICACIÓN --- Se importa toast

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // --- INICIO DE LA MODIFICACIÓN --- Se extrae la nueva acción y los datos del usuario
  const { user, claimDailyBonus } = useUserStore();
  const { marketData, isLoading, fetchMarketData } = useMarketStore();
  // --- FIN DE LA MODIFICACIÓN ---

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  const targetEndDate = user?.activeInvestments?.[0]?.endDate;
  const { timeLeft, isFinished } = useCountdown(targetEndDate);
  const handleDeposit = () => navigate('/deposit');
  const handleSupport = () => navigate('/support');

  // --- INICIO DE LA LÓGICA DEL BONO DIARIO ---
  const lastClaimDate = user?.lastBonusClaimedAt;

  const nextClaimDate = useMemo(() => {
    if (!lastClaimDate) return null;
    const date = new Date(lastClaimDate);
    date.setHours(date.getHours() + 24);
    return date.toISOString();
  }, [lastClaimDate]);

  const { timeLeft: bonusTimeLeft, isFinished: isBonusClaimable } = useCountdown(nextClaimDate);

  const handleClaimBonus = () => {
    toast.promise(
      claimDailyBonus(),
      {
        loading: 'Reclamando bono...',
        success: (data) => `¡Has reclamado ${data.message}!`,
        error: (err) => err.message, // Muestra el mensaje de error de la API
      }
    );
  };
  // --- FIN DE LA LÓGICA DEL BONO DIARIO ---
  
  const userBalance = user?.balance?.usdt || 0;
  const withdrawableBalance = user?.withdrawableBalance || 0;

  const renderMarketData = () => {
    if (isLoading && marketData.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-green mx-auto"></div>
        </div>
      );
    }
    
    if (!isLoading && marketData.length === 0) {
        return <p className="px-4 text-text-secondary text-center">No hay datos de mercado disponibles.</p>;
    }

    return <CryptoList data={marketData} />;
  };

  return (
    <div className="min-h-screen bg-system-background">
      <IOSHeader 
        balance={userBalance}
        onDeposit={handleDeposit}
      />

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* --- INICIO DE LA MODIFICACIÓN DEL BOTÓN DE BONO --- */}
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            onClick={handleClaimBonus}
            disabled={!isBonusClaimable} 
            className="bg-internal-card p-3 rounded-ios-card shadow-ios-card flex items-center justify-center space-x-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiGift className={`w-6 h-6 ${isBonusClaimable ? 'text-ios-green' : 'text-text-tertiary'}`} />
            <span className="text-sm font-ios font-medium text-text-primary">
              {isBonusClaimable ? t('home.claimBonus') : bonusTimeLeft}
            </span>
          </motion.button>
          {/* --- FIN DE LA MODIFICACIÓN DEL BOTÓN DE BONO --- */}
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
          <h2 className="font-ios-display text-xl font-bold text-text-primary">
            Mercado en Vivo
          </h2>
        </div>
        {renderMarketData()}
      </div>
    </div>
  );
};

export default HomePage;