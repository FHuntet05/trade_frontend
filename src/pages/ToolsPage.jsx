// --- START OF FILE src/pages/ToolsPage.jsx (RECONSTRUCCIÓN COMPLETA) ---

import React, { useState, useEffect, useMemo } from 'react';
import useToolsStore from '../store/toolsStore';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import UserInfoHeader from '../components/home/UserInfoHeader'; // Asumiendo nueva ruta
import ToolCard from '../components/tools/ToolCard';
import Loader from '../components/common/Loader';
import PurchaseFlowModal from '../components/tools/PurchaseModal';
// Importamos los demás modales si los necesitas
// import CryptoCurrencySelectionModal from '../components/modals/CryptoCurrencySelectionModal';
// import DirectDepositModal from '../components/modals/DirectDepositModal';

const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
const SINGLE_PURCHASE_TOOL_NAMES = ["VIP 1", "VIP 2", "VIP 3"];

const StatCard = ({ label, value }) => (
  <div className="bg-dark-secondary p-3 rounded-lg border border-white/10 text-center">
    <p className="text-xs text-text-secondary">{label}</p>
    <p className="font-bold text-white text-lg">{value}</p>
  </div>
);

const ToolsPage = () => {
  const { tools, loading, error, fetchTools } = useToolsStore();
  const { user } = useUserStore();
  
  // --- NUEVO ESTADO PARA LAS PESTAÑAS ---
  const [activeTab, setActiveTab] = useState('all_tools'); // 'all_tools' o 'my_tools'

  // --- LÓGICA DE MODALES (SE MANTIENE PERO SIMPLIFICADA POR AHORA) ---
  const [selectedTool, setSelectedTool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchTools(); }, [fetchTools]);

  const { ownedTools, toolCounts } = useMemo(() => {
    if (!user || !user.activeTools) return { ownedTools: [], toolCounts: {} };
    
    const counts = {};
    const owned = user.activeTools.map(purchase => {
        if (purchase.tool?._id) {
            const toolId = purchase.tool._id;
            counts[toolId] = (counts[toolId] || 0) + 1;
        }
        return purchase.tool;
    }).filter(Boolean); // Filtramos nulos o undefined

    return { ownedTools: owned, toolCounts: counts };
  }, [user]);

  const handleBuyClick = (tool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTool(null);
  };

  const TabButton = ({ tabName, label, badgeCount }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`relative flex-1 py-3 text-sm font-semibold transition-colors ${
        activeTab === tabName ? 'text-white' : 'text-text-secondary'
      }`}
    >
      {label}
      {badgeCount > 0 && <span className="absolute top-1 right-2 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">{badgeCount}</span>}
      {activeTab === tabName && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-start" layoutId="underline" />}
    </button>
  );

  return (
    // Contenedor principal con scroll
    <div className="flex flex-col h-full overflow-y-auto pb-24 p-4 space-y-5">
      <UserInfoHeader />

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Horas de trabajo" value="24H" />
        <StatCard label="Velocidad de minería" value={`${user?.effectiveMiningRate || 0} OSN/H`} />
      </div>

      {/* --- SISTEMA DE PESTAÑAS --- */}
      <div className="bg-dark-secondary rounded-lg border border-white/10 flex">
        <TabButton tabName="all_tools" label="Herramientas de minería" badgeCount={tools.length} />
        <TabButton tabName="my_tools" label="Mejora" />
      </div>

      <div className="flex justify-end">
          <button className="text-xs text-text-secondary hover:text-white">
              Historial de compras 
          </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader"><Loader /></motion.div>
        ) : error ? (
          <motion.div key="error" className="text-center text-red-400">{error}</motion.div>
        ) : (
          <div className="space-y-5">
            {/* Contenido condicional basado en la pestaña activa */}
            {activeTab === 'all_tools' && tools.map(tool => {
                const ownedCount = toolCounts[tool._id] || 0;
                const isLocked = SINGLE_PURCHASE_TOOL_NAMES.includes(tool.name) && ownedCount > 0;
                return (
                  <motion.div key={tool._id} variants={itemVariants} initial="hidden" animate="visible">
                    <ToolCard 
                      tool={tool} 
                      onBuyClick={handleBuyClick}
                      ownedCount={ownedCount}
                      isLocked={isLocked}
                    />
                  </motion.div>
                );
            })}
            
            {activeTab === 'my_tools' && (
              ownedTools.length > 0 ? ownedTools.map((tool, index) => (
                <motion.div key={`${tool._id}-${index}`} variants={itemVariants} initial="hidden" animate="visible">
                   {/* Reutilizamos ToolCard para mantener la consistencia visual */}
                  <ToolCard 
                    tool={tool} 
                    onBuyClick={() => {}} // No hay acción de compra aquí
                    ownedCount={1} // Mostramos 1 por cada instancia
                    isLocked={true} // Siempre se muestran como "adquiridas"
                  />
                </motion.div>
              )) : (
                <p className="text-center text-text-secondary pt-8">No tienes herramientas activas.</p>
              )
            )}
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL DE COMPRA (simplificado para claridad) --- */}
      <AnimatePresence>
        {isModalOpen && selectedTool && (
          <PurchaseFlowModal 
            tool={selectedTool}
            onClose={handleCloseModal}
            onSelectCrypto={() => { /* Lógica de compra aquí */ }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolsPage;
// --- END OF FILE src/pages/ToolsPage.jsx ---