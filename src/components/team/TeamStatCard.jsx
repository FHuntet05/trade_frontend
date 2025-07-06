// frontend/src/components/team/TeamStatCard.jsx (VERSIÓN CORREGIDA Y ROBUSTA)
import React from 'react';

const TeamStatCard = ({ label, value, isCurrency = false, icon }) => (
  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 flex flex-col justify-between">
    <div className="flex items-center justify-between text-gray-400">
      <span className="text-sm">{label}</span>
      {icon}
    </div>
    <p className="text-2xl font-bold text-white mt-2">
      {isCurrency && '$'}
      {/*
        LA CORRECCIÓN ESTÁ AQUÍ: (value || 0)
        Si 'value' es undefined o null, se usará 0 en su lugar, evitando el error.
      */}
      {(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </p>
  </div>
);

export default TeamStatCard;