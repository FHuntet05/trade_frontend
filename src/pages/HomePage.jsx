import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';
import { AccountCard, CryptoCard, SettlementTimer, TradingInfoCard, NavigationBar } from '../components/market/MarketComponents';
import { IOSLayout } from '../components/ui/IOSComponents';
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
    navigate('/crypto-selection');
  };

  const [showMissions, setShowMissions] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const priceStore = usePriceStore();
  const indicatorStore = useIndicatorStore();
  const rewardStore = useRewardStore();

  useEffect(() => {
    // Iniciar simulación de precios
    priceStore.startSimulation();
    // Verificar misiones diarias
    rewardStore.checkDailyMissions();
    
    return () => {
      priceStore.stopSimulation();
    };
  }, []);

  const handleMissionComplete = (missionId) => {
    rewardStore.completeMission(missionId);
    toast.success('¡Misión completada!');
  };

  return (
    <IOSLayout>
      <div className="min-h-screen bg-system-background pb-20">
        {/* Header Section */}
        <div className="bg-system-primary p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-ios-green flex items-center justify-center text-white">
                🏆
              </div>
              <div>
                <span className="font-ios-display font-semibold text-lg">
                  Trade Bot
                </span>
                <div className="flex items-center text-sm text-text-secondary">
                  <span>Nivel {rewardStore.level}</span>
                  <div className="w-20 h-1 bg-system-secondary rounded-full ml-2">
                    <div 
                      className="h-full bg-ios-green rounded-full"
                      style={{ width: `${(rewardStore.xp / (rewardStore.level * 1000)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="text-2xl relative"
                onClick={() => setShowMissions(true)}
              >
                📋
                {Object.keys(rewardStore.completedMissions).length < rewardStore.dailyMissions.length && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-ios-green rounded-full" />
                )}
              </button>
              <button className="text-2xl">🔔</button>
              <button className="text-2xl" onClick={() => navigate('/profile')}>⚙️</button>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 space-y-6"
        >
          {/* Account Balance Card */}
          <AccountCard
            balance={user.balance?.usdt || 0}
            onDeposit={handleDeposit}
          />

          {/* Settlement Timer */}
          <SettlementTimer hours={23} minutes={39} />

          {/* Trading Info */}
          <TradingInfoCard percentage="2-12%" />

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

            <div className="grid gap-4">
              {Object.entries(priceStore.prices).map(([symbol, price]) => {
                const change24h = priceStore.changes24h[symbol] || 0;
                const volume = priceStore.volumes[symbol] || 0;
                const indicators = indicatorStore.indicators[symbol] || {};
                
                return (
                  <motion.div
                    key={symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/trade/${symbol}`)}
                    className="bg-white rounded-ios-xl p-4 shadow-ios"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={`/assets/crypto/${symbol.toLowerCase()}.svg`}
                          alt={symbol}
                          className="w-10 h-10"
                        />
                        <div>
                          <h3 className="font-ios-display font-semibold">
                            {symbol}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            Vol: ${formatNumber(volume)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-ios-display font-semibold">
                          ${formatNumber(price)}
                        </p>
                        <p className={`text-sm ${
                          change24h >= 0 ? 'text-ios-green' : 'text-[#FF3B30]'
                        }`}>
                          {change24h >= 0 ? '↑' : '↓'} {Math.abs(change24h).toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    {/* Indicadores Técnicos */}
                    <div className="mt-3 flex items-center space-x-4 text-xs text-text-secondary">
                      {indicators.rsi && (
                        <span className={
                          indicators.rsi > 70 ? 'text-[#FF3B30]' :
                          indicators.rsi < 30 ? 'text-ios-green' :
                          'text-text-secondary'
                        }>
                          RSI: {indicators.rsi.toFixed(2)}
                        </span>
                      )}
                      {indicators.macd && (
                        <span className={
                          indicators.macd > 0 ? 'text-ios-green' : 'text-[#FF3B30]'
                        }>
                          MACD: {indicators.macd.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
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

        {/* Navigation Bar */}
        <NavigationBar
          selected={selectedTab}
          onSelect={setSelectedTab}
        />
      </div>
    </IOSLayout>
  );
};

export default HomePage;