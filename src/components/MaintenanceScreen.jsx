// frontend/src/components/MaintenanceScreen.jsx (COMPLETO)

import React from 'react';
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2';

const MaintenanceScreen = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-primary text-white p-6 text-center">
      <HiOutlineWrenchScrewdriver className="w-20 h-20 text-accent-start mb-6" />
      <h1 className="text-3xl font-bold mb-2">En Mantenimiento</h1>
      <p className="text-text-secondary max-w-md">
        {message || 'La aplicación está siendo actualizada para mejorar tu experiencia. Por favor, vuelve más tarde.'}
      </p>
    </div>
  );
};

export default MaintenanceScreen;