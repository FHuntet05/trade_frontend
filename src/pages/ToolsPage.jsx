// frontend/src/pages/ToolsPage.jsx (COMPLETO Y REPARADO v21.19)
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useToolsStore from '../store/toolsStore';

// --- INICIO DE LA CORRECCIÓN #1: IMPORTAR LA ACCIÓN DE ACTUALIZACIÓN ---
// Importamos el hook Y la acción para actualizar el estado del usuario.
import useUserStore from '../store/userStore';
// --- FIN DE LA CORRECCIÓN #1 ---

import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { tools, loading, error, fetchTools } = useToolsStore();
  
  // --- INICIO DE LA CORRECCIÓN #2: OBTENER LA FUNCIÓN DE ACTUALIZACIÓN ---
  // Obtenemos tanto el objeto 'user' como la función 'updateUser' desde el store.
  const { user, updateUser } = useUserStore();
  // --- FIN DE LA CORRECCIÓN #2 ---

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

  const handleBuyClick = (tool) => {
    setSelectedTool(tool);
  };
  
  const handleCloseAllModals = () => {
    setSelectedTool(null);
  };

  // Esta función maneja la navegación para el pago con criptomonedas
  const handleStartCryptoPayment = async (quantity) => {
    if (!selectedTool) return;
    const totalCost = selectedTool.price * quantity;
    
    const pricesPromise = api.get('/payment/prices');
    toast.promise(pricesPromise, {
        loading: 'Obteniendo precios...',
        success: (response) => {
            navigate('/crypto-selection', {
                state: {
                    totalCost: totalCost,
                    cryptoPrices: response.data,
                }
            });
            handleCloseAllModals();
            return 'Selecciona una moneda para pagar.';
        },
        error: (err) => err.response?.data?.message || 'No se pudieron obtener los precios.',
    });
  };

  // --- INICIO DE LA CORRECCIÓN #3: NUEVA FUNCIÓN PARA COMPRA CON SALDO ---
  // Creamos una función dedicada para la compra con saldo, que contiene la lógica crucial.
  const handlePurchaseWithBalance = async (quantity) => {
    if (!selectedTool) return;

    const purchasePromise = api.post('/tools/purchase-with-balance', {
      toolId: selectedTool._id,
      quantity,
    });

    toast.promise(purchasePromise, {
      loading: 'Procesando compra...',
      success: (response) => {
        // ¡ESTE ES EL PASO CLAVE QUE FALTABA!
        // Actualizamos el estado global con los datos del usuario devueltos por la API.
        // Esto notificará a toda la aplicación (incluida la HomePage) que el usuario ha cambiado.
        updateUser(response.data.user);
        
        handleCloseAllModals(); // Cerramos el modal
        return response.data.message || '¡Compra exitosa!';
      },
      error: (err) => err.response?.data?.message || 'No se pudo completar la compra.',
    });
  };
  // --- FIN DE LA CORRECCIÓN #3 ---
  
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

  const dailyMiningRate = user?.effectiveMiningRate || 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 p-4 space-y-5">
      <UserInfoHeader />
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Horas de trabajo" value="24H" />
        <StatCard label="Velocidad de minería" value={`${dailyMiningRate.toFixed(2)} NTX/Día`} />
      </div>
      <div className="bg-dark-secondary rounded-lg border border-white/10 flex">
        <TabButton tabName="all_tools" label="Herramientas de minería" badgeCount={tools.length} />
        <TabButton tabName="my_tools" label="Mejora" />
      </div>
      <div className="flex justify-end">
        <button className="text-xs text-text-secondary hover:text-white">Historial de compras</button>
      </div>
      
      <AnimatePresence mode="wait">
        {loading ? ( <motion.div key="loader"><Loader /></motion.div> ) 
        : error ? ( <motion.div key="error" className="text-center text-red-400">{error}</motion.div> ) 
        : (
          <div className="space-y-5">
            {activeTab === 'all_tools' && tools.map(tool => {
                const ownedCount = toolCounts[tool._id] || 0;
                const isLocked = SINGLE_PURCHASE_TOOL_NAMES.includes(tool.name) && ownedCount > 0;
                return (
                  <motion.div key={tool._id} variants={itemVariants} initial="hidden" animate="visible">
                    <ToolCard tool={tool} onBuyClick={handleBuyClick} ownedCount={ownedCount} isLocked={isLocked}/>
                  </motion.div>
                );
            })}
            {activeTab === 'my_tools' && (
              ownedTools.length > 0 ? ownedTools.map((tool, index) => (
                <motion.div key={`${tool._id}-${index}`} variants={itemVariants} initial="hidden" animate="visible">
                  <ToolCard tool={tool} onBuyClick={() => {}} ownedCount={1} isLocked={true}/>
                </motion.div>
              )) : ( <p className="text-center text-text-secondary pt-8">No tienes herramientas activas.</p> )
            )}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTool && (
          // --- INICIO DE LA CORRECCIÓN #4: PASAR LA NUEVA FUNCIÓN AL MODAL ---
          <PurchaseModal 
            tool={selectedTool} 
            onClose={handleCloseAllModals} 
            onSelectCrypto={handleStartCryptoPayment} // Esta maneja el flujo de pago con crypto
            onPurchaseWithBalance={handlePurchaseWithBalance} // Esta maneja el flujo de pago con saldo
          />
          // --- FIN DE LA CORRECCIÓN #4 ---
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolsPage;