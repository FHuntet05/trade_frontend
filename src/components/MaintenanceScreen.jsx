// RUTA: frontend/src/components/MaintenanceScreen.jsx (NUEVO ARCHIVO)
import React from 'react';
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2';

const MaintenanceScreen = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-primary text-white p-6 text-center">
      <HiOutlineWrenchScrewdriver className="w-24 h-24 text-accent-start mb-6" />
      <h1 className="text-3xl font-bold mb-4">En Mantenimiento</h1>
      <p className="text-lg text-text-secondary max-w-md">
        {message || 'Estamos realizando mejoras en el sistema. Por favor, vuelve en unos minutos.'}
      </p>
    </div>
  );
};

export default MaintenanceScreen;