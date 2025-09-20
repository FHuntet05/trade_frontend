// RUTA: src/components/tools/ToolCard.jsx (VERSIÓN "NEXUS - GLOBAL STYLE SYNC")
import React from 'react';

const ToolCard = ({ tool, onBuyClick, ownedCount, isLocked }) => {
  const isDisabled = isLocked || tool.isFree;

  let buttonText;
  if (tool.isFree) {
    buttonText = 'INCLUIDO';
  } else if (isLocked) {
    buttonText = 'ADQUIRIDO';
  } else {
    buttonText = 'COMPRAR YA';
  }

  return (
    <div className={`
      bg-dark-secondary/70 backdrop-blur-lg rounded-2xl p-5 border flex flex-col gap-4 text-white
      ${isDisabled ? 'border-gray-600/50' : 'border-white/10'}
    `}>
      {/* Cabecera de la tarjeta */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold">{tool.name}</h3> 
        </div>
        <img 
          src={tool.imageUrl || '/assets/images/tool-placeholder.png'} 
          alt={tool.name} 
          className={`w-16 h-16 object-contain flex-shrink-0 ${isDisabled ? 'opacity-50' : ''}`}
        />
      </div>

      {/* Detalles de la herramienta */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Producción por hora</span> 
          <span className="font-semibold">{tool.miningBoost || 0} NTX/24h</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Días válidos</span>
          <span className="font-semibold">{tool.durationDays || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Precio</span>
          <span className="font-bold text-xl text-green-400">{tool.price || 0} USDT</span>
        </div>
      </div>
      
      {/* [NEXUS STYLE SYNC] - Se actualiza el color del texto a 'text-accent' */}
      {ownedCount > 0 && !tool.isFree && (
        <div className="text-center text-xs text-accent bg-accent/10 py-1 rounded-md">
          Posees: {ownedCount}
        </div>
      )}

      {/* Botón de compra */}
      <button 
        onClick={() => onBuyClick(tool)}
        disabled={isDisabled}
        className={`
          w-full mt-2 py-3 text-white font-bold rounded-full transition-all duration-150
          ${isDisabled 
            ? 'bg-gray-700 cursor-not-allowed opacity-60' 
            // [NEXUS STYLE SYNC] - Se reemplaza el gradiente por el color de acento sólido
            : 'bg-accent shadow-glow transform active:scale-95'
          }
        `}
      >
        {buttonText}
      </button>

    </div>
  );
};

export default ToolCard;