import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { IOSCard } from '../components/ui/IOSComponents';
import InvestmentModal from '../components/market/InvestmentModal';
import useStore from '../store/store';

const MarketPage = () => {
  const [cryptos, setCryptos] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, api, updateUserBalance } = useStore();

  useEffect(() => {
    fetchCryptos();
  }, []);

  const fetchCryptos = async () => {
    try {
      const response = await api.get('/investments/available');
      if (response.data.success) {
        setCryptos(response.data.data);
      }
    } catch (error) {
      toast.error('Error al cargar las criptomonedas disponibles');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvestClick = (crypto) => {
    setSelectedCrypto(crypto);
    setIsModalOpen(true);
  };

  const handleInvestSubmit = async (investmentData) => {
    try {
      const response = await api.post('/investments/create', investmentData);
      if (response.data.success) {
        toast.success('Inversión realizada con éxito');
        updateUserBalance(response.data.data.newBalance);
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al realizar la inversión');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-system-background ios-safe-top flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-system-background ios-safe-top pb-20">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-ios-display font-bold text-text-primary mb-6">
          Mercado
        </h1>

        {cryptos.map((crypto, index) => (
          <motion.div
            key={crypto.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <IOSCard className="mb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={crypto.icon}
                    alt={crypto.symbol}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-ios-display font-semibold">
                      {crypto.name}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      {crypto.symbol}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-ios-green font-semibold">
                    +{crypto.profitRange.min}% - {crypto.profitRange.max}% diario
                  </p>
                  <p className="text-text-secondary text-sm">
                    Min: ${crypto.minInvestment} USDT
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-system-secondary">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Duración</span>
                  <span className="text-text-primary">24 horas</span>
                </div>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-4 bg-ios-green text-white py-3 rounded-ios font-ios text-center"
                  onClick={() => handleInvestClick(crypto)}
                >
                  Invertir Ahora
                </motion.button>
              </div>
            </IOSCard>
          </motion.div>
        ))}
      </div>

      {selectedCrypto && (
        <InvestmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          crypto={selectedCrypto}
          userBalance={user.balance.usdt}
          onInvest={handleInvestSubmit}
        />
      )}
    </div>
  );
};

export default MarketPage;