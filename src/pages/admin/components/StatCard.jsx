import React from 'react';

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="bg-dark-secondary p-6 rounded-lg flex items-center gap-6 border border-white/10 shadow-lg">
      <div className="bg-accent-start/20 p-4 rounded-full">
        <Icon className="w-8 h-8 text-accent-start" />
      </div>
      <div>
        <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;