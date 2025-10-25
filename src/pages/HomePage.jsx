// RUTA: src/pages/HomePage.jsx

import React from 'react'; // Se elimina useEffect ya que no se usará
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// --- INICIO DE LA CORRECCIÓN CRÍTICA ---
// Se corrigen las importaciones para que sean explícitas y se elimina la importación de 'usePriceStore' desde un índice.
import useUserStore from '@/store/userStore';
import usePriceStore from '@/store/priceStore';
// --- FIN DE LA CORRECCIÓN CRÍTICA ---
import { IOSHeader } from '@/components/ui/ios/Header';
import { CryptoList } from '@/components/ui/ios/CryptoList';
import { FiGift, FiMessageSquare } from 'react-icons/fi';
import { formatters } from '@/utils/formatters';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  // --- INICIO DE LA CORRECCIÓN CRÍTICA ---
  // Se obtiene únicamente 'prices' del store. 'fetchPrices' ya no existe.
  const { prices } = usePriceStore();

  // Se ELIMINA por completo el 'useEffect' que intentaba llamar a 'fetchPrices'.
  // La actualización de precios ahora es gestionada globalmente por el hook 'usePriceWebSocket' en App.jsx.
  // --- FIN DE LA CORRECCIÓN CRÍTICA ---

  const handleDeposit = () => navigate('/deposit');
  const handleClaimBonus = () => navigate('/bonus'); // Esta ruta deberá ser creada
  const handleSupport = () => navigate('/support');

  const topCryptos = [
    // Los datos ahora se leen directamente del 'prices' store, que es actualizado por el WebSocket.
    { name: 'Bitcoin', symbol: 'BTC', price: prices.BTC || 0, change: 2.4 },
    { name: 'Ethereum', symbol: 'ETH', price: prices.ETH || 0, change: 1.8 },
    { name: 'BNB', symbol: 'BNB', price: prices.BNB || 0, change: -0.5 },
    { name: 'Solana', symbol: 'SOL', price: prices.SOL || 0, change: 5.2 },
    { name: 'Tether', symbol: 'USDT', price: prices.USDT || 1.00, change: 0.0 },
  ];
  
  // Se accede de forma segura al saldo del usuario.
  const userBalance = user?.balance?.usdt || 0;
  // Se accede al nuevo saldo retirable.
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
          {/* Se usa el nuevo campo 'withdrawableBalance' */}
          <p className="text-text-secondary text-sm mb-1 font-ios">{t('home.availableWithdrawal')}</p>
          <p className="text-3xl font-ios-display font-bold text-text-primary mb-3">
            {formatters.formatCurrency(withdrawableBalance)}
          </p>
          <div className="bg-system-secondary rounded-ios p-3 inline-flex items-center justify-center">
            <p className="text-text-secondary text-sm font-ios">
              {/* NOTA: Este temporizador sigue siendo estático. Se corregirá en un paso posterior. */}
              ⏰ {t('home.nextProfitIn')} <span className="font-semibold text-text-primary">23:39:42</span>
            </p>
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