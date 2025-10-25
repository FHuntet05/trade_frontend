// RUTA: src/pages/HomePage.jsx
// --- INICIO DE LA REFACTORIZACIÓN COMPLETA PARA DATOS DINÁMICOS ---

import React, { useState, useEffect } from 'react'; // Se añade useState y useEffect
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/userStore';
import api from '@/api/axiosConfig'; // 1. Se importa el cliente de API.
// import usePriceStore from '@/store/priceStore'; // 2. Se elimina la dependencia del priceStore obsoleto.

import { IOSHeader } from '@/components/ui/ios/Header';
import { CryptoList } from '@/components/ui/ios/CryptoList';
import { FiGift, FiMessageSquare } from 'react-icons/fi';
import { formatters } from '@/utils/formatters';
import useCountdown from '@/hooks/useCountdown';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  // const { prices } = usePriceStore(); // Se elimina

  // 3. Se introducen estados para manejar los datos del mercado de forma dinámica.
  const [marketData, setMarketData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 4. Se utiliza useEffect para obtener los datos del mercado cuando el componente se monta.
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        // Se llama a nuestro endpoint de backend ya corregido.
        const response = await api.get('/market/prices');
        // La respuesta es un objeto, lo convertimos a un array que CryptoList puede usar.
        const dataArray = Object.values(response.data);
        setMarketData(dataArray);
      } catch (error) {
        console.error("Error al obtener los datos del mercado:", error);
        // Opcional: manejar el estado de error en la UI.
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, []); // El array vacío asegura que se ejecute solo una vez.

  // La lógica del countdown y de navegación se mantiene intacta.
  const targetEndDate = user?.activeInvestments?.[0]?.endDate;
  const { timeLeft, isFinished } = useCountdown(targetEndDate);
  const handleDeposit = () => navigate('/deposit');
  const handleClaimBonus = () => navigate('/bonus');
  const handleSupport = () => navigate('/support');

  // 5. Se elimina la lista estática 'topCryptos'.
  /* const topCryptos = [ ... ]; */

  const userBalance = user?.balance?.usdt || 0;
  const withdrawableBalance = user?.withdrawableBalance || 0;

  return (
    <div className="min-h-screen bg-system-background">
      <IOSHeader 
        balance={userBalance}
        onDeposit={handleDeposit}
      />

      <div className="p-4 space-y-4">
        {/* El resto de la UI se mantiene igual */}
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
            {isFinished ? (
              <p className="text-text-secondary text-sm font-ios">
                Realiza una inversión para ver tus ganancias
              </p>
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
        {/* 6. Se pasan los datos dinámicos y el estado de carga al componente CryptoList. */}
        <CryptoList cryptos={marketData} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default HomePage;
// --- FIN DE LA REFACTORIZACIÓN COMPLETA ---