// src/components/tools/ToolCard.jsx (VERSIÓN FINAL CON LÓGICA DE BLOQUEO Y CONTADOR)
import React from 'react';

const ToolCard = ({ tool, onBuyClick, ownedCount, isLocked }) => {
  return (
    <div className={`
      bg-dark-secondary/70 backdrop-blur-lg rounded-2xl p-5 border flex flex-col gap-4 text-white
      ${isLocked ? 'border-gray-600/50' : 'border-white/10'}
    `}>
      {/* Cabecera de la tarjeta */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          {/* Se mantiene el título original */}
          <h3 className="text-xl font-bold">{tool.name}</h3> 
        </div>
        <img 
          src={tool.imageUrl || '/assets/images/tool-placeholder.png'} 
          alt={tool.name} 
          className={`w-16 h-16 object-contain flex-shrink-0 ${isLocked ? 'opacity-50' : ''}`}
        />
      </div>

      {/* Detalles de la herramienta */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Producción por hora</span> 
          <span className="font-semibold">{tool.miningBoost || 0} NTX/H</span>
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
      
      {/* --- INICIO DE LA NUEVA LÓGICA --- */}

      {/* Indicador de herramientas poseídas (solo si es > 0) */}
      {ownedCount > 0 && (
        <div className="text-center text-xs text-accent-start bg-accent-start/10 py-1 rounded-md">
          Posees: {ownedCount}
        </div>
      )}

      {/* Botón de compra condicional */}
      <button 
        onClick={() => onBuyClick(tool)}
        disabled={isLocked}
        className={`
          w-full mt-2 py-3 text-white font-bold rounded-full transition-all duration-150
          ${isLocked 
            ? 'bg-gray-700 cursor-not-allowed opacity-60' 
            : 'bg-gradient-to-r from-accent-start to-accent-end shadow-glow transform active:scale-95'
          }
        `}
      >
        {isLocked ? 'ADQUIRIDO' : 'COMPRAR AHORA'}
      </button>
      {/* --- FIN DE LA NUEVA LÓGICA --- */}

    </div>
  );
};

export default ToolCard;