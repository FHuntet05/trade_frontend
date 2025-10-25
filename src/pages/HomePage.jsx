// RUTA: src/pages/HomePage.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/userStore';
import usePriceStore from '@/store/priceStore';
import { IOSHeader } from '@/components/ui/ios/Header';
import { CryptoList } from '@/components/ui/ios/CryptoList';
import { FiGift, FiMessageSquare } from 'react-icons/fi';
import { formatters } from '@/utils/formatters';
// --- INICIO DE LA MODIFICACIÓN CRÍTICA (Importación del Countdown) ---
import useCountdown from '@/hooks/useCountdown'; // 1. Se importa el nuevo hook.
// --- FIN DE LA MODIFICACIÓN CRÍTICA ---

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { prices } = usePriceStore();

  // --- INICIO DE LA MODIFICACIÓN CRÍTICA (Uso del Countdown) ---
  // 2. Se accede de forma segura a la fecha de finalización de la primera inversión activa.
  // El '?' (optional chaining) previene errores si 'user' o 'activeInvestments' no existen.
  const targetEndDate = user?.activeInvestments?.[0]?.endDate;

  // 3. Se llama al hook con la fecha objetivo.
  // 'timeLeft' contendrá el string "HH:MM:SS" y 'isFinished' nos dirá si mostrarlo.
  const { timeLeft, isFinished } = useCountdown(targetEndDate);
  // --- FIN DE LA MODIFICACIÓN CRÍTICA ---

  const handleDeposit = () => navigate('/deposit');
  const handleClaimBonus = () => navigate('/bonus');
  const handleSupport = () => navigate('/support');

  const topCryptos = [
    { name: 'Bitcoin', symbol: 'BTC', price: prices.BTC || 0, change: 2.4 },
    { name: 'Ethereum', symbol: 'ETH', price: prices.ETH || 0, change: 1.8 },
    { name: 'BNB', symbol: 'BNB', price: prices.BNB || 0, change: -0.5 },
    { name: 'Solana', symbol: 'SOL', price: prices.SOL || 0, change: 5.2 },
    { name: 'Tether', symbol: 'USDT', price: prices.USDT || 1.00, change: 0.0 },
  ];
  
  const userBalance = user?.balance?.usdt || 0;
  const withdrawableBalance = user?.withdrawableBalance || 0;

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
            {formatters.formatCurrency(withdrawableBalance)}
          </p>
          <div className="bg-system-secondary rounded-ios p-3 inline-flex items-center justify-center">
            {/* --- INICIO DE LA MODIFICACIÓN CRÍTICA (Renderizado Condicional del Countdown) --- */}
            {/* 4. Lógica de renderizado:
                - Si 'isFinished' es true (no hay inversión o ya terminó), se muestra el mensaje alternativo.
                - Si es false, se muestra el temporizador dinámico.
            */}
            {isFinished ? (
              <p className="text-text-secondary text-sm font-ios">
                Realiza una inversión para ver tus ganancias
              </p>
            ) : (
              <p className="text-text-secondary text-sm font-ios">
                ⏰ {t('home.nextProfitIn')} <span className="font-semibold text-text-primary">{timeLeft}</span>
              </p>
            )}
            {/* --- FIN DE LA MODIFICACIÓN CRÍTICA --- */}
          </div>
        </motion.div>
      </div>

      <div className="mt-4 pb-24">
        <div className="px-4 mb-3">
          <h2 className="font-ios-display text-xl font-bold text-text-primary">
            Mercado en Vivo
          </h2>
        </div>
        <CryptoList cryptos={topCryptos} />
      </div>
    </div>
  );
};

export default HomePage;