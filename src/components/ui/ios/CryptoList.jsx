// RUTA: src/components/ui/ios/CryptoList.jsx
// --- VERSIÓN REFORZADA ANTI-CRASH ---

import React from 'react';
import { motion } from 'framer-motion';
import { formatters } from '@/utils/formatters';

const SYMBOL_ASSET_MAP = {
  BTC: '/assets/images/BTC.png',
  ETH: '/assets/images/ETH.png',
  BNB: '/assets/images/BNB.png',
  SOL: '/assets/images/SOL.png',
  USDT: '/assets/images/USDT.png',
  TON: '/assets/images/TON.png',
  TONCOIN: '/assets/images/TON.png',
  LTC: '/assets/images/litecoin.png',
  TRX: '/assets/images/TRON.png',
  DOGE: '/assets/images/DOGE.png',
};

const DEFAULT_ASSET = '/assets/images/USDT.png';

const NAME_KEYWORD_MAP = [
  { keyword: 'TON', asset: '/assets/images/TON.png' },
  { keyword: 'TONCOIN', asset: '/assets/images/TON.png' },
];

const resolveIconSource = (crypto) => {
  if (!crypto) {
    return DEFAULT_ASSET;
  }

  const symbol = typeof crypto.symbol === 'string' ? crypto.symbol.trim().toUpperCase() : '';
  if (symbol && SYMBOL_ASSET_MAP[symbol]) {
    return SYMBOL_ASSET_MAP[symbol];
  }

  const imageValue = crypto.image;
  if (typeof imageValue === 'string' && imageValue.trim() !== '') {
    return imageValue;
  }

  if (typeof crypto.name === 'string' && crypto.name.trim() !== '') {
    const normalizedName = crypto.name.trim().toUpperCase();
    const matchByName = NAME_KEYWORD_MAP.find((entry) => normalizedName.includes(entry.keyword));
    if (matchByName) {
      return matchByName.asset;
    }
  }

  return DEFAULT_ASSET;
};

// Cambiamos el nombre del prop de 'cryptos' a 'data' para mayor claridad
export const CryptoList = ({ data, isLoading }) => { 
  if (isLoading) {
    return <div className="px-4 py-8 text-center text-text-secondary">Cargando datos del mercado...</div>;
  }

  // 1. GUARDIA ANTI-CRASH: Verificamos si 'data' es realmente un array antes de intentar usar .map()
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="px-4 py-8 text-center text-text-secondary">No hay datos de mercado disponibles.</div>;
  }

  return (
    <div className="space-y-3">
      {/* 2. Ahora usamos 'data.map' con la seguridad de que es un array */}
      {data.map((crypto, index) => (
        <motion.div
          key={crypto.symbol}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-internal-card rounded-ios-card p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={resolveIconSource(crypto)}
                alt={`${crypto.name} icon`}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-ios-display font-semibold text-text-primary">
                  {crypto.name}
                </h3>
                <p className="text-sm text-text-secondary font-ios">
                  {crypto.symbol}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-ios font-medium text-text-primary">
                {formatters.formatCurrency(crypto.price, 6)}
              </p>
              <p className={`text-sm font-ios ${crypto.change >= 0 ? 'text-ios-green' : 'text-red-500'}`}>
                {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};