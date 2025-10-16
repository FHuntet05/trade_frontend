// RUTA: frontend/src/pages/BannedUserPage.jsx (NUEVO ARCHIVO)
import React from 'react';
import { BannedIcon } from '@/components/icons/AppIcons';

const BannedUserPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-dark-primary text-white p-4 text-center">
      <div className="bg-dark-secondary p-8 rounded-2xl border border-red-500/30 shadow-xl max-w-sm">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-6">
          <BannedIcon className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-red-400 mb-2">Acceso Denegado</h1>
        <p className="text-text-secondary">
          Tu cuenta ha sido suspendida por infringir nuestros términos de servicio.
        </p>
        <p className="text-sm text-text-secondary/70 mt-4">
          Si crees que esto es un error, por favor, contacta con el soporte técnico para más información.
        </p>
      </div>
    </div>
  );
};

export default BannedUserPage;