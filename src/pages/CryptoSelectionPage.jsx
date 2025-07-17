// frontend/src/pages/CryptoSelectionPage.jsx (NUEVO ARCHIVO)
import React, { useState } from 'react';
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
  const { tool, quantity, totalCost } = location.state || {};
  
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  const handleCurrencySelected = async (selectedCurrency) => {
    setIsGeneratingInvoice(true);
    try {
      const { data: invoice } = await api.post('/wallet/create-deposit-invoice', { 
        toolId: tool._id,
        quantity: quantity,
        currency: selectedCurrency.currency,
      });
      
      setPaymentInfo({
        paymentAddress: invoice.address_user,
        paymentAmount: invoice.amount,
        currency: `${selectedCurrency.currency} (${selectedCurrency.chain})`
      });

    } catch (error) {
        toast.error(error.response?.data?.message || 'Error al generar la dirección de pago.');
    } finally {
        setIsGeneratingInvoice(false);
    }
  };

  if (!tool) {
    return (
        <div className="min-h-screen bg-dark-primary text-white p-4 flex flex-col items-center justify-center">
            <h1 className="text-xl text-red-400">Error: No se encontraron los detalles de la compra.</h1>
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
        <div className="flex items-center justify-between mb-6 bg-black/20 p-4 rounded-lg">
            <div className="flex items-center gap-4">
                <img src={tool.imageUrl} alt={tool.name} className="w-12 h-12" />
                <div>
                    <p className="font-bold">{tool.name} (x{quantity})</p>
                    <p className="text-sm text-text-secondary">Total a Pagar:</p>
                </div>
            </div>
            <p className="text-2xl font-mono">{totalCost.toFixed(2)} USDT</p>
        </div>
        
        <div className="space-y-3">
          {isGeneratingInvoice 
            ? <Loader text="Generando dirección..." />
            : SUPPORTED_CURRENCIES.map((currency) => (
                <CurrencyItem 
                  key={currency.ticker} 
                  currency={currency} 
                  onSelect={handleCurrencySelected}
                  disabled={isGeneratingInvoice}
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