// frontend/src/components/ranking/UserSummaryCard.jsx (SIMPLIFICADO)
import React from 'react';

const UserSummaryCard = ({ summary }) => {
  // Si no hay datos de resumen, no renderizamos nada para evitar errores.
  if (!summary) return null;

  return (
    <div className="bg-dark-secondary rounded-xl p-4 border border-white/10 flex justify-around text-white text-center">
      <div>
        <p className="text-sm text-text-secondary">Mi ranking</p>
        <p className="text-3xl font-bold mt-1">{summary.rank || '--'}</p>
      </div>
      <div>
        {/* --- CAMBIO: El label ahora viene directamente del backend --- */}
        <p className="text-sm text-text-secondary">{summary.label || 'Mi Puntuación'}</p>
        <p className="text-3xl font-bold mt-1">
          {/* Se formatea el score para que se vea bien */}
          {summary.score?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
        </p>
      </div>
    </div>
  );
};

export default UserSummaryCard;