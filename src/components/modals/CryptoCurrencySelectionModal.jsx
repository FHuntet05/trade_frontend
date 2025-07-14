// frontend/src/components/modals/CryptoCurrencySelectionModal.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';
import Loader from '../common/Loader';

// --- DEFINIMOS LAS MONEDAS QUE VAMOS A ACEPTAR ---
// Puedes expandir esta lista fácilmente en el futuro.
// Usamos logos de un CDN confiable (CryptoCompare).
// --- LISTA DE MONEDAS ACTUALIZADA ---
const SUPPORTED_CURRENCIES = [
  { name: 'USDT (Red BSC - BEP20)', ticker: 'USDT_BSC', logo: 'https://seeklogo.com/images/T/tether-usdt-logo-FA5531D648-seeklogo.com.png', chain: 'BSC', currency: 'USDT' },
  { name: 'USDT (Red Tron - TRC20)', ticker: 'USDT_TRON', logo: 'https://seeklogo.com/images/T/tether-usdt-logo-FA5531D648-seeklogo.com.png', chain: 'TRON', currency: 'USDT' },
  { name: 'BNB (Red BSC - BEP20)', ticker: 'BNB', logo: 'https://www.cryptocompare.com/media/37746242/bnb.png', chain: 'BSC', currency: 'BNB' },
  { name: 'Tron (Red Tron - TRC20)', ticker: 'TRX', logo: 'https://www.cryptocompare.com/media/37746888/trx.png', chain: 'TRON', currency: 'TRX' },
];

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 150, damping: 25 } },
  exit: { y: "100%", opacity: 0, transition: { duration: 0.3 } },
};

// Componente para un solo item de la lista de monedas
const CurrencyItem = ({ currency, onSelect }) => (
  <button
    onClick={() => onSelect(currency.ticker)}
    className="w-full flex items-center p-3 bg-black/20 rounded-lg hover:bg-white/10 transition-colors"
  >
    <img src={currency.logo} alt={currency.name} className="w-8 h-8 rounded-full mr-4" />
    <div className="text-left">
      <p className="font-bold text-white">{currency.name}</p>
      <p className="text-sm text-text-secondary">{currency.ticker}</p>
    </div>
  </button>
);


const CryptoCurrencySelectionModal = ({ isLoading, onSelect, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end items-end z-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="bg-dark-primary w-full h-[75vh] max-w-lg rounded-t-2xl border-t border-white/10 flex flex-col"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-2xl z-10">
            <Loader text="Generando dirección..." />
          </div>
        )}

        <header className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Selecciona una Moneda</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <HiXMark className="w-6 h-6 text-white" />
          </button>
        </header>

        <main className="flex-grow p-4 overflow-y-auto">
          <div className="space-y-3">
            {SUPPORTED_CURRENCIES.map((currency) => (
              <CurrencyItem 
                key={currency.ticker} 
                currency={currency} 
                onSelect={onSelect} 
              />
            ))}
          </div>
        </main>
      </motion.div>
    </motion.div>
  );
};

export default CryptoCurrencySelectionModal;