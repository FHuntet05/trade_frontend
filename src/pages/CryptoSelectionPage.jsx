// frontend/src/pages/CryptoSelectionPage.jsx (RECONSTRUCCIÓN DE LAYOUT v24.0)
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion'; // Se importa motion
import api from '../api/axiosConfig'; 
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import DirectDepositModal from '../components/modals/DirectDepositModal';
import { HiArrowLeft, HiChevronRight } from 'react-icons/hi2';
import StaticPageLayout from '../components/layout/StaticPageLayout';
const SUPPORTED_CURRENCIES = [
  { name: 'BEP20-USDT', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png', chain: 'BSC', currency: 'USDT' },
  { name: 'TRC20-USDT', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png', chain: 'TRON', currency: 'USDT' },
  { name: 'TRX', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png', chain: 'TRON', currency: 'TRX' },
  { name: 'BNB', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png', chain: 'BSC', currency: 'BNB' },
];

const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

const CurrencyItem = ({ currency, onSelect, disabled }) => (
  <motion.button
    variants={itemVariants}
    onClick={() => onSelect(currency)}
    disabled={disabled}
    className="w-full flex items-center p-4 bg-dark-tertiary/50 rounded-lg hover:bg-dark-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <img src={currency.logo} alt={currency.name} className="w-10 h-10 rounded-full mr-4" />
    <span className="font-bold text-white text-lg">{currency.name}</span>
    <HiChevronRight className="w-6 h-6 text-text-secondary ml-auto" />
  </motion.button>
);

const CryptoSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const hasValidState = location.state && typeof location.state.totalCost !== 'undefined' && location.state.cryptoPrices;
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  if (!hasValidState) {
    // Esta pantalla de error es correcta y se mantiene.
    return (
        <div className="flex flex-col h-full items-center justify-center text-center p-4">
            <h1 className="text-xl text-red-400 font-bold mb-2">Error de Flujo de Pago</h1>
            <p className="text-text-secondary mb-4">No se recibieron los datos necesarios. Por favor, inicia el proceso de compra de nuevo.</p>
            <button onClick={() => navigate('/tools')} className="mt-4 px-4 py-2 bg-accent-start rounded-lg font-semibold text-white">Volver a Herramientas</button>
        </div>
    );
  }
  
  const { totalCost, cryptoPrices } = location.state;
  
  const handleCurrencySelected = async (selectedCurrency) => {
    setIsLoading(true);
    try {
      const response = await api.post('/payment/generate-address', { chain: selectedCurrency.chain });
      const { address } = response.data;
      let amountToSend = totalCost;
      const price = cryptoPrices[selectedCurrency.currency];
      if (selectedCurrency.currency !== 'USDT' && price > 0) {
        amountToSend = totalCost / price;
      }
      setPaymentInfo({
          paymentAddress: address,
          paymentAmount: amountToSend.toFixed(8),
          currency: `${selectedCurrency.currency} (${selectedCurrency.chain})`
      });
    } catch (error) {
        toast.error(error.response?.data?.message || 'Error al generar la dirección de pago.');
    } finally {
        setIsLoading(false);
    }
  };
  
  // =======================================================================
  // === INICIO DE LA CORRECCIÓN DE LAYOUT (OPERACIÓN ESTABILIDAD TOTAL) ===
  //
  // JUSTIFICACIÓN: Se adopta la misma estructura de contenedor que 'TeamPage.jsx'
  // y otras páginas principales. Se usa 'flex flex-col h-full' para asegurar que
  // la página ocupe toda la altura y herede el fondo del layout padre.
  // Se añade 'motion.div' para una animación de entrada consistente.
  //
  return (
    <>
      <StaticPageLayout title="Seleccionar Criptomoneda">
          <motion.div 
              key="content" 
              initial="hidden" 
              animate="visible" 
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
              className="space-y-3"
          >
              {isLoading 
              ? <div className="flex justify-center pt-10"><Loader text="Generando dirección..." /></div>
              : SUPPORTED_CURRENCIES.map((currency) => (
                  <CurrencyItem 
                      key={currency.name} 
                      currency={currency} 
                      onSelect={handleCurrencySelected}
                      disabled={isLoading}
                  />
              ))
              }
          </motion.div>
      </StaticPageLayout>
      {/* --- FIN DE LA MODIFICACIÓN --- */}
      
      <AnimatePresence>
        {paymentInfo && (
          <DirectDepositModal 
            paymentInfo={paymentInfo}
            onClose={() => setPaymentInfo(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
  // === FIN DE LA CORRECCIÓN DE LAYOUT ===
  // =======================================================================
};

export default CryptoSelectionPage;