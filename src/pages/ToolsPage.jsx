// frontend/src/pages/ToolsPage.jsx (v21.22 - i18n)
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useToolsStore from '../store/toolsStore';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import UserInfoHeader from '../components/home/UserInfoHeader';
import ToolCard from '../components/tools/ToolCard';
import Loader from '../components/common/Loader';
import PurchaseModal from '../components/tools/PurchaseModal';

const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
const SINGLE_PURCHASE_TOOL_NAMES = ["VIP 1", "VIP 2", "VIP 3"];

const StatCard = ({ label, value }) => (
  <div className="bg-dark-secondary p-3 rounded-lg border border-white/10 text-center">
    <p className="text-xs text-text-secondary">{label}</p>
    <p className="font-bold text-white text-lg">{value}</p>
  </div>
);

const ToolsPage = () => {
  const { t } = useTranslation();
  const { tools, loading, error, fetchTools } = useToolsStore();
  const { user } = useUserStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('all_tools');
  const [selectedTool, setSelectedTool] = useState(null);
  
  useEffect(() => { fetchTools(); }, [fetchTools]);

  const { ownedTools, toolCounts } = useMemo(() => {
    if (!user || !user.activeTools) return { ownedTools: [], toolCounts: {} };
    const counts = {};
    user.activeTools.forEach(purchase => {
        if (purchase.tool?._id) {
            counts[purchase.tool._id] = (counts[purchase.tool._id] || 0) + 1;
        }
    });
    const owned = user.activeTools.map(purchase => purchase.tool).filter(Boolean);
    return { ownedTools: owned, toolCounts: counts };
  }, [user]);

  const handleBuyClick = (tool) => setSelectedTool(tool);
  const handleCloseAllModals = () => setSelectedTool(null);

  const handleStartCryptoPayment = async (quantity) => {
    if (!selectedTool) return;
    const totalCost = selectedTool.price * quantity;
    const pricesPromise = api.get('/payment/prices');
    toast.promise(pricesPromise, {
        loading: t('profilePage.toasts.loadingPrices'),
        success: (response) => {
            navigate('/crypto-selection', { state: { totalCost: totalCost, cryptoPrices: response.data } });
            handleCloseAllModals();
            return t('profilePage.toasts.selectCoin');
        },
        error: (err) => err.response?.data?.message || t('common.error'),
    });
  };
  
  const TabButton = ({ tabName, label, badgeCount }) => (
    <button onClick={() => setActiveTab(tabName)} className={`relative flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === tabName ? 'text-white' : 'text-text-secondary'}`}>
      {label}
      {badgeCount > 0 && <span className="absolute top-1 right-2 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">{badgeCount}</span>}
      {activeTab === tabName && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-start" layoutId="underline" />}
    </button>
  );

  const dailyMiningRate = user?.effectiveMiningRate || 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 p-4 space-y-5">
      <UserInfoHeader />
      <div className="grid grid-cols-2 gap-4">
        <StatCard label={t('toolsPage.hoursOfWork')} value="24H" />
        <StatCard label={t('toolsPage.miningSpeed')} value={`${dailyMiningRate.toFixed(2)} ${t('toolsPage.perDay')}`} />
      </div>
      <div className="bg-dark-secondary rounded-lg border border-white/10 flex">
        <TabButton tabName="all_tools" label={t('toolsPage.tabs.allTools')} badgeCount={tools.length} />
        <TabButton tabName="my_tools" label={t('toolsPage.tabs.myTools')} />
      </div>
      <div className="flex justify-end">
        <button className="text-xs text-text-secondary hover:text-white">{t('toolsPage.purchaseHistory')}</button>
      </div>
      <AnimatePresence mode="wait">
        {loading ? ( <motion.div key="loader"><Loader /></motion.div> ) 
        : error ? ( <motion.div key="error" className="text-center text-red-400">{error}</motion.div> ) 
        : (
          <div className="space-y-5">
            {activeTab === 'all_tools' && tools.map(tool => {
                const ownedCount = toolCounts[tool._id] || 0;
                const isLocked = SINGLE_PURCHASE_TOOL_NAMES.includes(tool.name) && ownedCount > 0;
                return (<motion.div key={tool._id} variants={itemVariants} initial="hidden" animate="visible"><ToolCard tool={tool} onBuyClick={handleBuyClick} ownedCount={ownedCount} isLocked={isLocked}/></motion.div>);
            })}
            {activeTab === 'my_tools' && (
              ownedTools.length > 0 ? ownedTools.map((tool, index) => (<motion.div key={`${tool._id}-${index}`} variants={itemVariants} initial="hidden" animate="visible"><ToolCard tool={tool} onBuyClick={() => {}} ownedCount={1} isLocked={true}/></motion.div>)) 
              : ( <p className="text-center text-text-secondary pt-8">{t('toolsPage.noActiveTools')}</p> )
            )}
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedTool && (<PurchaseModal tool={selectedTool} onClose={handleCloseAllModals} onSelectCrypto={handleStartCryptoPayment} />)}
      </AnimatePresence>
    </div>
  );
};
export default ToolsPage;