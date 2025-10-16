import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserStore, usePriceStore, useIndicatorStore, useRewardStore } from '@store';
import api from '../api/axiosConfig';
import { IOSLayout, IOSCard, IOSButton } from '../components/ui/IOSComponents';
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

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useUserStore();
  const [selectedTab, setSelectedTab] = useState('home');
  
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
    priceStore.startSimulation();
    rewardStore.checkDailyMissions();
    
    return () => {
      priceStore.stopSimulation();
    };
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
    <IOSLayout>
      <div className="min-h-screen bg-system-background pb-20">
        {/* Header Balance Section */}
        <div className="bg-gradient-to-r from-ios-green to-ios-green-light p-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Saldo Disponible</p>
              <p className="text-2xl font-ios-display font-bold">
                ${(user.balance?.usdt || 0).toFixed(2)} USDT
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDeposit}
              className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-ios text-white font-ios"
            >
              💰 Depósito
            </motion.button>
          </div>

          {/* Action Buttons */}
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

          {/* Misiones Diarias */}
          {showMissions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <IOSCard className="w-full max-w-md p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-ios-display font-bold">
                    Misiones Diarias
                  </h2>
                  <button onClick={() => setShowMissions(false)}>✕</button>
                </div>

                <div className="space-y-4">
                  {rewardStore.dailyMissions.map(mission => {
                    const isCompleted = rewardStore.completedMissions[mission.id];
                    return (
                      <div key={mission.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{mission.description}</p>
                          <p className="text-sm text-text-secondary">
                            Recompensa: {mission.xp} XP
                          </p>
                        </div>
                        {isCompleted ? (
                          <span className="text-ios-green">✓</span>
                        ) : (
                          <IOSButton
                            variant="primary"
                            onClick={() => handleMissionComplete(mission.id)}
                          >
                            Reclamar
                          </IOSButton>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-system-secondary">
                  <p className="text-center text-text-secondary">
                    Racha actual: {rewardStore.dailyStreak} días
                  </p>
                </div>
              </IOSCard>
            </motion.div>
          )}
        </motion.div>
      </div>
    </IOSLayout>
  );
};

export default HomePage;