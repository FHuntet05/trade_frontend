// frontend/src/components/profile/ActionGrid.jsx
import React from 'react';

// Añadimos la prop 'gridCols' con un valor por defecto.
const ActionGrid = ({ actions, gridCols = 'grid-cols-4' }) => (
  // Usamos la nueva prop en la clase de Tailwind.
  <div className={`grid ${gridCols} gap-4 text-center`}>
    {actions.map((action, index) => (
      <button key={index} onClick={action.onClick} className="flex flex-col items-center space-y-2 text-white">
        <div className="w-12 h-12 bg-dark-secondary/60 rounded-lg flex items-center justify-center text-primary">
          <action.icon className="w-6 h-6" />
        </div>
        <span className="text-xs">{action.label}</span>
      </button>
    ))}
  </div>
);

export default ActionGrid;