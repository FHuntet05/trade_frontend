// RUTA: frontend/src/admin/AdminApp.jsx (VERSIÓN "NEXUS - ROUTER FIX")
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import useAdminStore from '../store/adminStore';
import Loader from '../components/common/Loader';

// Componentes y Páginas
import AdminLayout from '../components/layout/AdminLayout';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminUserDetailPage from '../pages/admin/AdminUserDetailPage';
import AdminTransactionsPage from '../pages/admin/AdminTransactionsPage';
import AdminWithdrawalsPage from '../pages/admin/AdminWithdrawalsPage';
import AdminToolsPage from '../pages/admin/AdminToolsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminSecurityPage from '../pages/admin/AdminSecurityPage';
import AdminTreasuryPage from '../pages/admin/AdminTreasuryPage';
import SweepControlPage from '../pages/admin/SweepControlPage';
import GasDispenserPage from '../pages/admin/GasDispenserPage';
import AdminNotificationsPage from '../pages/admin/AdminNotificationsPage'; 
import AdminBlockchainMonitorPage from '../pages/admin/AdminBlockchainMonitorPage';
import AdminInvestmentsPage from '../pages/admin/AdminInvestmentsPage';

function AdminApp() {
  const { isAuthenticated, _hasHydrated } = useAdminStore();

  // Este efecto AHORA SÍ funcionará porque es la única app que controla el body.
  useEffect(() => {
    document.body.classList.add('admin-body');
    return () => {
      document.body.classList.remove('admin-body');
    };
  }, []);

  if (!_hasHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-dark-primary">
        <Loader text="Cargando aplicación..." />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {isAuthenticated ? (
          // --- RUTAS PROTEGIDAS ---
          // Si el usuario está autenticado, definimos el layout principal en la ruta /admin
          <Route path="/admin" element={<AdminLayout />}>
            {/* Las rutas anidadas ahora son relativas a /admin */}
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="users/:id" element={<AdminUserDetailPage />} />
            <Route path="transactions" element={<AdminTransactionsPage />} />
            <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
            <Route path="tools" element={<AdminToolsPage />} />
            <Route path="factories" element={<AdminToolsPage />} /> {/* Alias para consistencia con sidebar */}
            <Route path="security" element={<AdminSecurityPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="treasury" element={<AdminTreasuryPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="sweep-control" element={<SweepControlPage />} />
            <Route path="gas-dispenser" element={<GasDispenserPage />} />
            <Route path="blockchain-monitor" element={<AdminBlockchainMonitorPage />} />
            <Route path="investments" element={<AdminInvestmentsPage />} />
            {/* Redirección: si se accede a /admin, ir a dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        ) : (
          // --- RUTA PÚBLICA ---
          // Si no está autenticado, solo la ruta de login es accesible
          <Route path="/admin/login" element={<AdminLoginPage />} />
        )}
        
        {/* --- CATCH-ALL DEFINITIVO --- */}
        {/* Si cualquier otra ruta es accedida, redirigir basado en el estado de autenticación */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/admin/dashboard" : "/admin/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default AdminApp;