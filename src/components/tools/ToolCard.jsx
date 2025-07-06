// src/components/tools/ToolCard.jsx (NUEVO ARCHIVO)
import React from 'react';

// ¡IMPORTANTE! Asumo que tu modelo 'Tool' en el backend tiene estos campos:
// name, vipLevel, dailyProduction, durationDays, price, imageUrl.
// Si los nombres son diferentes, ajústalos aquí.

const ToolCard = ({ tool, onBuyClick }) => {
  return (
    <div className="bg-dark-secondary/70 backdrop-blur-lg rounded-2xl p-5 border border-white/10 flex flex-col gap-4 text-white">
      {/* Cabecera de la tarjeta */}
      <div className="flex justify-between items-start gap-4">
  <div className="flex-1"> {/* Este div permite que el texto ocupe el espacio sobrante */}
    <h3 className="text-xl font-bold">{`Herramienta de aceleración de minería ${tool.vipLevel}`}</h3>
  </div>
  <img 
    src={tool.imageUrl || '/assets/tool-icon-placeholder.png'} 
    alt={tool.name} 
    className="w-16 h-16 object-contain flex-shrink-0" // flex-shrink-0 evita que la imagen se encoja
  />
</div>

      {/* Detalles de la herramienta */}
<div className="space-y-2 text-sm">
  {/* CAMBIO: Usamos 'miningBoost' en lugar de 'dailyProduction' */}
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

      {/* Botón de compra */}
      <button 
        onClick={() => onBuyClick(tool)}
        className="w-full mt-2 py-3 bg-gradient-to-r from-accent-start to-accent-end text-white font-bold rounded-full shadow-glow transform active:scale-95 transition-transform"
      >
        COMPRAR AHORA
      </button>
    </div>
  );
};

export default ToolCard;