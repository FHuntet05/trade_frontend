import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserStore, usePriceStore, useIndicatorStore, useRewardStore } from '@store';
import api from '../api/axiosConfig';
import { IOSHeader } from '@/components/ui/ios/Header';
import { CryptoList } from '@/components/ui/ios/CryptoList';
import { CloseIcon } from '@/components/icons/AppIcons';
import toast from 'react-hot-toast';

const cryptoList = [
  { name: 'BitcoinCash', symbol: 'BCH', price: 195.36, day: '2-9%' },
  { name: 'Polkadot', symbol: 'DOT', price: 4.89, day: '2.5%' },
  { name: 'Tron', symbol: 'TRX', price: 0.08008, day: '4-10%' },
  { name: 'Solana', symbol: 'SOL', price: 0.16138, day: '1-4%' },
  { name: 'Dogecoin', symbol: 'DOGE', price: 0.05294, day: '5-8%' },
  { name: 'Litecoin', symbol: 'LTC', price: 80.75, day: '3-12%' },
  { name: 'Cardano', symbol: 'ADA', price: 0.4729999, day: '2-10%' }
];

const TOP_CRYPTOS = [
  { name: 'Bitcoin', symbol: 'BTC', price: 66240.50, change: 2.4 },
  { name: 'Ethereum', symbol: 'ETH', price: 3218.75, change: 1.8 },
  { name: 'BNB', symbol: 'BNB', price: 456.32, change: -0.5 },
  { name: 'Solana', symbol: 'SOL', price: 128.45, change: 5.2 },
  { name: 'Tether', symbol: 'USDT', price: 1.00, change: 0.1 },
];

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useUserStore();
  
  const handleInvest = async (crypto) => {
    try {
      // Verificar saldo antes de invertir
      if (!user.balance?.usdt || user.balance.usdt < 10) {
        toast.error('Saldo insuficiente. Mínimo 10 USDT');
        return;
      }
      
      navigate('/investment', { state: { crypto } });
    } catch (error) {
      toast.error('Error al procesar la inversión');
    }
  };

  const handleDeposit = () => {
    navigate('/deposit');
  };

  const handleClaimBonus = () => {
    toast.success('¡Bono reclamado!');
  };

  const handleSupport = () => {
    navigate('/support');
  };

  const [showMissions, setShowMissions] = useState(false);
  const priceStore = usePriceStore();
  const indicatorStore = useIndicatorStore();
  const rewardStore = useRewardStore();

  useEffect(() => {
    try {
      priceStore.startSimulation();
      rewardStore.checkDailyMissions();
      
      const cleanup = () => {
        try {
          priceStore.stopSimulation();
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      };
      
      return cleanup;
    } catch (error) {
      console.error('Error in HomePage useEffect:', error);
    }
  }, [priceStore, rewardStore]);

  const handleMissionComplete = (missionId) => {
    rewardStore.completeMission(missionId);
    toast.success('¡Misión completada!');
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <IOSHeader 
        balance={user.balance?.usdt || 0}
        onDeposit={handleDeposit}
        onClaimBonus={handleClaimBonus}
        onSupport={handleSupport}
      />

      {/* Main Content */}
      <div className="pb-24">
        {/* Stats Card */}
        <div className="p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-4 border border-accent/20"
          >
            <div className="text-center mb-4">
              <p className="text-text-secondary text-sm">Retiro Disponible</p>
              <p className="text-2xl font-bold text-accent mt-1">
                ${((user.balance?.usdt || 0) * 0.8).toFixed(2)}
              </p>
            </div>

            <div className="bg-dark-secondary/50 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <p className="text-sm text-text-secondary">
                Próxima ganancia en: <span className="font-medium text-accent">23:39:42</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="p-4">
          <div className="flex space-x-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleClaimBonus}
              className="flex-1 bg-white/20 backdrop-blur-sm p-3 rounded-ios flex items-center justify-center space-x-2"
            >
              <span>🎁</span>
              <span className="text-sm font-ios">Reclamar Bono</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSupport}
              className="flex-1 bg-white/20 backdrop-blur-sm p-3 rounded-ios flex items-center justify-center space-x-2"
            >
              <span>🎧</span>
              <span className="text-sm font-ios">Soporte</span>
            </motion.button>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 space-y-6"
        >
          {/* Withdrawal Balance */}
          <IOSCard className="text-center">
            <p className="text-text-secondary text-sm mb-2">Disponible para Retiro</p>
            <p className="text-3xl font-ios-display font-bold text-ios-green mb-4">
              ${((user.balance?.usdt || 0) * 0.8).toFixed(2)}
            </p>
            <div className="bg-system-secondary rounded-ios p-3">
              <p className="text-text-secondary text-sm">
                ⏰ Próxima ganancia en: <span className="font-semibold text-ios-green">23:39:42</span>
              </p>
            </div>
          </IOSCard>

          {/* Live Market Data */}
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-ios-display text-lg font-semibold">
                Mercado en Vivo
              </h2>
              <button 
                className="text-ios-green font-ios"
                onClick={() => navigate('/market')}
              >
                Ver Más
              </button>
            </div>

            <div className="space-y-3">
              {cryptoList.slice(0, 5).map((crypto, index) => (
                <motion.div
                  key={crypto.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-ios-xl p-4 shadow-ios-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-ios-green/10 rounded-full flex items-center justify-center">
                        <span className="font-ios-display font-bold text-ios-green">
                          {crypto.symbol.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-ios-display font-semibold">
                          {crypto.name}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {crypto.symbol}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-ios-display font-semibold">
                        ${crypto.price}
                      </p>
                      <p className="text-sm text-ios-green">
                        +{crypto.day}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Top Cryptos */}
          <div className="mt-2">
            <CryptoList cryptos={TOP_CRYPTOS} />
          </div>
        </motion.div>

        {/* Misiones Diarias Modal */}
        <AnimatePresence>
          {showMissions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-dark-secondary rounded-2xl w-full max-w-md p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Misiones Diarias</h2>
                  <button 
                    onClick={() => setShowMissions(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {rewardStore.dailyMissions?.map(mission => (
                    <div key={mission.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div>
                        <p className="font-medium">{mission.description}</p>
                        <p className="text-sm text-text-secondary">
                          Recompensa: {mission.xp} XP
                        </p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMissionComplete(mission.id)}
                        disabled={rewardStore.completedMissions[mission.id]}
                        className={`px-4 py-2 rounded-xl font-medium ${
                          rewardStore.completedMissions[mission.id]
                            ? 'bg-accent/20 text-accent'
                            : 'bg-accent text-white'
                        }`}
                      >
                        {rewardStore.completedMissions[mission.id] ? 'Completado' : 'Reclamar'}
                      </motion.button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-center text-text-secondary">
                    Racha actual: <span className="text-accent font-medium">{rewardStore.dailyStreak} días</span>
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HomePage;