// frontend/src/pages/CryptoSelectionPage.jsx (NUEVO ARCHIVO)
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import DirectDepositModal from '../components/modals/DirectDepositModal';
import { HiArrowLeft } from 'react-icons/hi2';

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
    className="w-full flex items-center p-3 bg-black/20 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <img src={currency.logo} alt={currency.name} className="w-8 h-8 rounded-full mr-4" />
    <div className="text-left">
      <p className="font-bold text-white">{currency.name}</p>
      <p className="text-sm text-text-secondary">{currency.ticker}</p>
    </div>
  </button>
);

const CryptoSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalCost, cryptoPrices } = location.state || {};
  
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
      
      if (selectedCurrency.currency !== 'USDT' && price) {
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
              <button onClick={() => navigate('/tools')} className="mt-4 px-4 py-2 bg-accent-start rounded-lg">Volver a la Tienda</button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-dark-primary text-white p-4">
      <header className="flex items-center mb-6">
        <button onClick={() => navigate('/tools')} className="mr-4 p-2 rounded-full hover:bg-white/10">
          <HiArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Seleccionar Criptomoneda</h1>
      </header>

      <main className="max-w-md mx-auto bg-dark-secondary p-6 rounded-2xl border border-white/10">
        <div className="text-center mb-6">
          <p className="text-text-secondary">Total a Pagar:</p>
          <p className="text-3xl font-bold font-mono">{totalCost.toFixed(2)} USDT</p>
        </div>
        
        <div className="space-y-3">
          {isLoading 
            ? <Loader text="Generando dirección..." />
            : SUPPORTED_CURRENCIES.map((currency) => (
                <CurrencyItem 
                  key={currency.ticker} 
                  currency={currency} 
                  onSelect={handleCurrencySelected}
                  disabled={isLoading}
                />
            ))
          }
        </div>
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