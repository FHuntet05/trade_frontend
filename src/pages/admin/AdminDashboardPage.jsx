// frontend/src/pages/admin/AdminDashboardPage.jsx (COMPLETO)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminStore from '../../store/adminStore';

const AdminDashboardPage = () => {
  const { admin, logout } = useAdminStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-primary text-white">
      {/* Header */}
      <header className="bg-dark-secondary p-4 shadow-md flex justify-between items-center border-b border-white/10">
        <h1 className="text-xl font-bold text-accent-start">Dashboard de Administración</h1>
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

      {/* Main Content */}
      <main className="flex-grow p-6">
        <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
          <h2 className="text-2xl font-semibold mb-4">Estadísticas Principales</h2>
          <p className="text-text-secondary">
            Aquí se mostrarán las estadísticas y herramientas de gestión de la aplicación.
            Este es el punto de partida para todas las operaciones de administración.
          </p>
          {/* Aquí irán los componentes del dashboard: gráficos, tablas, etc. */}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;