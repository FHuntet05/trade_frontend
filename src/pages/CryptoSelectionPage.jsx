// frontend/src/pages/CryptoSelectionPage.jsx (VERSIÓN v17.8 - RUTAS RELATIVAS CORREGIDAS)
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig'; 
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import DirectDepositModal from '../components/modals/DirectDepositModal';
import { HiArrowLeft, HiChevronRight } from 'react-icons/hi2'; // Se añade HiChevronRigh
const SUPPORTED_CURRENCIES = [
  { name: 'USDT (Red BSC - BEP20)', ticker: 'USDT_BSC', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png', chain: 'BSC', currency: 'USDT' },
  { name: 'USDT (Red Tron - TRC20)', ticker: 'USDT_TRON', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png', chain: 'TRON', currency: 'USDT' },
  { name: 'BNB (Red BSC - BEP20)', ticker: 'BNB', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png', chain: 'BSC', currency: 'BNB' },
  { name: 'Tron (Red Tron - TRC20)', ticker: 'TRX', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png', chain: 'TRON', currency: 'TRX' },
];

const CurrencyItem = ({ currency, onSelect, disabled }) => (
  <button
    onClick={() => onSelect(currency)}
    disabled={disabled}
    className="w-full flex items-center p-4 bg-dark-tertiary/50 rounded-lg hover:bg-dark-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <img src={currency.logo} alt={currency.name} className="w-10 h-10 rounded-full mr-4" />
    <span className="font-bold text-white text-lg">{currency.name}</span>
    <HiChevronRight className="w-6 h-6 text-text-secondary ml-auto" />
  </button>
);

const CryptoSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalCost, cryptoPrices } = location.state || {}; // Se simplifica, ya no se necesita tool/quantity aquí
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const handleCurrencySelected = async (selectedCurrency) => {
    setIsLoading(true);
    try {
      const response = await api.post('/payment/generate-address', { 
          chain: selectedCurrency.chain, 
      });
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
  
  if (!totalCost || !cryptoPrices) {
      return (
          <div className="min-h-screen bg-dark-primary text-white p-4 flex flex-col items-center justify-center">
              <h1 className="text-xl text-red-400">Error: Faltan datos para el pago.</h1>
              <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-accent-start rounded-lg">Volver</button>
          </div>
      );
  }

  const isPurchaseFlow = !!tool;

 return (
    // --- CORRECCIÓN: Se mantiene el fondo del layout pero el contenido se rediseña ---
    <div className="p-4">
      <header className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-white/10">
          <HiArrowLeft className="w-6 h-6" />
        </button>
        {/* --- CORRECCIÓN: Título adaptado al de la imagen de referencia --- */}
        <h1 className="text-xl font-bold">Recargar Seleccionar</h1>
      </header>

      {/* --- CORRECCIÓN: Se elimina el contenedor y el header de "Total a depositar" --- */}
      <main className="space-y-3">
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
      </main>
      
      <AnimatePresence>
        {paymentInfo && (
          <DirectDepositModal 
            paymentInfo={paymentInfo}
            onClose={() => setPaymentInfo(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CryptoSelectionPage;