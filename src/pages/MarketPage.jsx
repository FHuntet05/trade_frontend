// RUTA: frontend/src/pages/MarketPage.jsx (VERSIÓN REDISEÑADA VISUALMENTE)

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import useInvestmentStore from '@/store/investmentStore';
import useUserStore from '@/store/userStore';
import InvestmentModal from '@/components/market/InvestmentModal';
import { CryptoIcon } from '@/components/icons/CryptoIcons';
import { FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import useSWR from 'swr'; // Importamos SWR para fetching de precios en tiempo real

// Helper para obtener datos con axios (para SWR)
const fetcher = (url) => api.get(url).then(res => res.data);

// --- NUEVO COMPONENTE DE TARJETA REDISEÑADO ---
const MarketItemCard = ({ item, onPurchaseClick }) => {
    // Usamos SWR para obtener el precio en tiempo real de la cripto vinculada.
    // Se revalida cada 30 segundos.
    const { data: cryptoData } = useSWR(`/prices/${item.linkedCryptoSymbol}`, fetcher, { refreshInterval: 30000 });
    const priceChange = cryptoData?.data?.percent_change_24h || 0;

    return (
        <motion.div
            className="bg-internal-card rounded-ios-xl shadow-ios-card overflow-hidden border border-transparent hover:border-ios-green transition-all duration-300"
            whileHover={{ y: -5 }}
        >
            <div className="p-4">
                {/* --- Cabecera de la Tarjeta --- */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-full object-cover bg-gray-100 p-1" />
                        <div>
                            <h3 className="font-ios-display font-bold text-lg text-text-primary">{item.name}</h3>
                            <p className="font-ios text-sm text-text-secondary">{item.linkedCryptoSymbol}</p>
                        </div>
                    </div>
                    {item.saleDiscountPercentage > 0 && (
                        <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            OFERTA -{item.saleDiscountPercentage}%
                        </div>
                    )}
                </div>

                {/* --- Sección de Precios y Cambios (como en tu imagen) --- */}
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <p className="font-ios-display font-bold text-2xl text-text-primary">
                            {cryptoData ? `$${parseFloat(cryptoData.data.price).toFixed(2)}` : 'Cargando...'}
                        </p>
                        <div className={`flex items-center gap-1 text-sm font-semibold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            <FiTrendingUp />
                            <span>{priceChange.toFixed(2)}% (24h)</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-text-secondary">Precio del Plan</p>
                        <p className="font-ios-display font-bold text-xl text-text-primary">{item.price} USDT</p>
                    </div>
                </div>
                
                {/* --- Sección de Detalles del Plan --- */}
                <div className="space-y-2 text-sm border-t border-system-secondary pt-3">
                    <div className="flex justify-between text-text-secondary"><span>Duración:</span> <span className="font-semibold text-text-primary">{item.durationDays} días</span></div>
                    <div className="flex justify-between text-text-secondary"><span>Ganancia Diaria:</span> <span className="font-semibold text-text-primary">{item.dailyProfitAmount} USDT</span></div>
                    <div className="flex justify-between text-text-secondary"><span>ROI Total:</span> <span className="font-bold text-ios-green">{item.totalRoiPercentage}%</span></div>
                </div>
            </div>

            {/* --- Botón de Acción --- */}
            <div className="p-3 bg-gray-50/50">
                <button
                    onClick={() => onPurchaseClick(item)}
                    className="w-full py-3 text-sm font-ios font-semibold bg-ios-green text-white rounded-ios-lg hover:bg-ios-green/90 transition-colors flex items-center justify-center gap-2"
                >
                    <FiCheckCircle />
                    <span>INVERTIR AHORA</span>
                </button>
            </div>
        </motion.div>
    );
};


// --- COMPONENTE DE PÁGINA PRINCIPAL (Lógica actualizada) ---
const MarketPage = () => {
  const { investmentPackages, isLoading, error, fetchInvestmentPackages } = useInvestmentStore(state => ({
      investmentPackages: state.investmentPackages,
      isLoading: state.isLoading,
      error: state.error,
      fetchInvestmentPackages: state.fetchInvestmentPackages
  }));
  const user = useUserStore(state => state.user);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Usamos esta lógica para asegurar que siempre se carguen los datos al visitar la página
    fetchInvestmentPackages();
  }, [fetchInvestmentPackages]);

  const handlePurchaseClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => setIsModalOpen(false);

  const renderContent = () => {
    if (isLoading && investmentPackages.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ios-green mx-auto"></div>
          <p className="mt-4 text-text-secondary">Cargando mercado...</p>
        </div>
      );
    }

    if (error && investmentPackages.length === 0) {
      return (
        <div className="text-center py-20 text-text-secondary">
          <p>{error}</p>
          <button onClick={fetchInvestmentPackages} className="mt-4 text-ios-green font-semibold">Reintentar</button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {investmentPackages.map((item) => (
          <MarketItemCard
            key={item._id}
            item={item}
            onPurchaseClick={handlePurchaseClick}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-system-background pb-24">
      <div className="p-4 pt-6">
        <h1 className="text-3xl font-ios-display font-bold text-text-primary mb-2">
          Mercado
        </h1>
        <p className="text-text-secondary mb-6">Elige un plan de inversión para empezar a generar ganancias.</p>
        
        {renderContent()}
      </div>
      
      {isModalOpen && selectedItem && (
          <InvestmentModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            item={selectedItem}
            userBalance={user?.balance?.usdt || 0}
          />
      )}
    </div>
  );
};

export default MarketPage;