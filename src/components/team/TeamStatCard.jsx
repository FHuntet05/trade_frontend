// frontend/src/components/team/TeamStatCard.jsx (VERSIÓN CORREGIDA Y FINAL)
import React from 'react';

const TeamStatCard = ({ label, value, isCurrency = false, icon }) => {
  // <<< INICIO DE LA LÓGICA DE FORMATO CONDICIONAL >>>
  const formatValue = (val) => {
    const numericValue = val || 0;

    // Si es moneda, usa dos decimales.
    if (isCurrency) {
      return numericValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    // Si no es moneda (ej: conteo de miembros), lo muestra como un entero.
    return numericValue.toLocaleString('en-US', {
      maximumFractionDigits: 0,
    });
  };
  // <<< FIN DE LA LÓGICA DE FORMATO CONDICIONAL >>>

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 flex flex-col justify-between">
      <div className="flex items-center justify-between text-text-secondary">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white mt-2">
        {isCurrency && '$'}
        {/* Usamos la nueva función de formateo */}
        {formatValue(value)}
      </p>
    </div>
  );
};

export default TeamStatCard;