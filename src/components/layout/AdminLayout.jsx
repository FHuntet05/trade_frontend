// frontend/src/components/layout/AdminLayout.jsx (COMPLETO)

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../../pages/admin/components/Sidebar';
import useAdminStore from '../../store/adminStore';

const AdminLayout = () => {
  const { admin, logout } = useAdminStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-dark-primary text-white">
      <Sidebar />
      <div className="flex-grow flex flex-col">
        {/* Encabezado superior */}
        <header className="bg-dark-secondary p-4 flex justify-end items-center border-b border-white/10">
          <div className="flex items-center gap-4">
            <span className="text-text-secondary">Bienvenido, <strong className="text-white">{admin?.username}</strong></span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 font-bold text-red-400 bg-red-500/20 rounded-lg hover:bg-red-500/40 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>
        
        {/* Contenido principal de la página (Dashboard, Usuarios, etc.) */}
        <main className="flex-grow p-6">
          <Outlet /> {/* Aquí se renderizará el componente de la ruta activa */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;