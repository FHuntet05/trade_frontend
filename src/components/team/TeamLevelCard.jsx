// frontend/src/components/team/TeamLevelCard.jsx
import React from 'react';

const TeamLevelCard = ({ level, members, commission }) => (
  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 text-white">
    <h3 className="font-bold text-lg">NIVEL {level}</h3>
    <div className="space-y-2 mt-3 text-sm">
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Personas</span>
        <span className="font-semibold">{members}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Comisión</span>
        <span className="font-semibold text-green-400">
          ${commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
    <button className="w-full mt-4 py-2 text-sm font-semibold bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
      Detalles
    </button>
  </div>
);

export default TeamLevelCard;