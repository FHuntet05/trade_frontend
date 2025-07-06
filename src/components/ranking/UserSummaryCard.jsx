// frontend/src/components/ranking/UserSummaryCard.jsx
import React from 'react';

const UserSummaryCard = ({ summary, type }) => {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 flex justify-around text-white text-center">
      <div>
        <p className="text-sm text-gray-400">Mi ranking</p>
        <p className="text-2xl font-bold">{summary.rank || '--'}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400">
          {type === 'individual' ? 'Mi cantidad' : 'Usuarios del equipo'}
        </p>
        <p className="text-2xl font-bold">{summary.score?.toLocaleString() || '0'}</p>
      </div>
    </div>
  );
};
export default UserSummaryCard;