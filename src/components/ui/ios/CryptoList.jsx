// RUTA: src/components/ui/ios/CryptoList.jsx

import React from 'react';
import { motion } from 'framer-motion';
// --- INICIO DE LA MODIFICACIÓN ---
// Se elimina la importación de 'CryptoIcon' ya que será reemplazado por <img>.
// import { CryptoIcon } from '@/components/icons/CryptoIcons'; 
// --- FIN DE LA MODIFICACIÓN ---
import { formatters } from '@/utils/formatters';

export const CryptoList = ({ cryptos }) => {
  if (!cryptos || cryptos.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-text-tertiary">
        Cargando datos del mercado...
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4">
      {cryptos.map((crypto, index) => (
        <motion.div
          key={crypto.symbol}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-internal-card rounded-ios-card p-4 shadow-ios-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* --- INICIO DE LA MODIFICACIÓN --- */}
              {/* Se reemplaza el div con CryptoIcon por un tag <img>. */}
              {/* La ruta apunta a /public/assets/images/{SYMBOL}.png (asumiendo que las imágenes se colocarán allí). */}
              {/* Se aplican estilos para que la imagen sea circular y del tamaño adecuado. */}
              <img 
                src={`/assets/images/${crypto.symbol.toUpperCase()}.png`} 
                alt={`${crypto.name} icon`}
                className="w-10 h-10 rounded-full object-cover"
              />
              {/* --- FIN DE LA MODIFICACIÓN --- */}
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