// frontend/src/pages/ToolsPage.jsx (VERSIÓN CON ANIMACIONES STAGGER)
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useToolsStore from '../store/toolsStore';
import ToolCard from '../components/tools/ToolCard';
import PurchaseFlowModal from '../components/tools/PurchaseModal';
import CryptoInvoiceModal from '../components/tools/CryptoInvoiceModal';
import Loader from '../components/common/Loader'; // <-- 1. IMPORTAMOS NUESTRO NUEVO LOADER
import { motion, AnimatePresence } from 'framer-motion'; // <-- 2. IMPORTAMOS HERRAMIENTAS DE ANIMACIÓN

// --- 3. DEFINIMOS LAS VARIANTES DE ANIMACIÓN ---
// Esto hace el código más limpio y reutilizable.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Este es el efecto clave: aplica un retraso de 0.1s entre cada hijo
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 }, // Empieza 20px abajo e invisible
  visible: {
    y: 0,
    opacity: 1,
    transition: {
        type: 'spring',
        stiffness: 120,
    }
  }, // Vuelve a su posición original y se hace visible
};

const ToolsPage = () => {
  const { t } = useTranslation();
  const { tools, loading, error, fetchTools } = useToolsStore();
  
  const [selectedTool, setSelectedTool] = useState(null);
  const [isPurchaseFlowOpen, setIsPurchaseFlowOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const handleBuyClick = (tool) => {
    setSelectedTool(tool);
    setIsPurchaseFlowOpen(true);
  };
  
  const handleShowInvoice = (data) => {
    setInvoiceData(data);
    setIsPurchaseFlowOpen(false);
    setIsInvoiceOpen(true);
  };

  const handleCloseAllModals = () => {
    setSelectedTool(null);
    setIsPurchaseFlowOpen(false);
    setIsInvoiceOpen(false);
    setInvoiceData(null);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{t('tools.title')}</h1>
        <p className="text-text-secondary">{t('tools.subtitle')}</p>
      </div>
      
      {/* --- 4. LA LÓGICA DE ANIMACIÓN PRINCIPAL --- */}
      <AnimatePresence mode="wait">
        {loading ? (
          // Usamos la 'key' para que AnimatePresence sepa qué elemento está en pantalla
          <motion.div key="loader">
            <Loader text={t('tools.loading')} />
          </motion.div>
        ) : error ? (
           <motion.div key="error" className="text-center text-red-400 pt-16">{error}</motion.div>
        ) : (
          // 5. El contenedor de la lista se convierte en un motion.div
          <motion.div
            key="tools-list"
            className="grid grid-cols-1 gap-5"
            variants={containerVariants} // Le pasamos las variantes del contenedor
            initial="hidden"             // Estado inicial
            animate="visible"            // Estado final
          >
            {tools.map(tool => (
              // 6. Cada tarjeta se envuelve en su propio motion.div
              // No necesita initial/animate porque los hereda del padre
              <motion.div key={tool._id} variants={itemVariants}>
                <ToolCard tool={tool} onBuyClick={handleBuyClick} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Los modales no necesitan cambiar */}
      {isPurchaseFlowOpen && selectedTool && (
        <PurchaseFlowModal 
          tool={selectedTool}
          onClose={handleCloseAllModals}
          onShowInvoice={handleShowInvoice}
        />
      )}

      {isInvoiceOpen && selectedTool && invoiceData && (
        <CryptoInvoiceModal
          tool={selectedTool}
          invoiceData={invoiceData}
          onClose={handleCloseAllModals}
        />
      )}
    </div>
  );
};

export default ToolsPage;