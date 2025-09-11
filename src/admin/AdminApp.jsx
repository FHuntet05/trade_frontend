// frontend/src/admin/AdminApp.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Componentes del Modelo que nos proporcionó
import AdminLayout from '../components/layout/AdminLayout'; // Asumo que está en esta ruta
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminProtectedRoute from '../components/layout/AdminProtectedRoute';

// Páginas del panel de administración (sus rutas actuales)
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

function AdminApp() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Ruta pública para el login del admin */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Rutas protegidas que requieren autenticación de admin */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/users/:id/details" element={<AdminUserDetailPage />} />
            <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
            <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
            <Route path="/admin/tools" element={<AdminToolsPage />} />
            <Route path="/admin/security" element={<AdminSecurityPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/treasury" element={<AdminTreasuryPage />} />
            <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
            <Route path="/admin/sweep-control" element={<SweepControlPage />} />
            <Route path="/admin/gas-dispenser" element={<GasDispenserPage />} />
            <Route path="/admin/blockchain-monitor" element={<AdminBlockchainMonitorPage />} />
            {/* Redirección base de /admin a /admin/dashboard */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>
        
        {/* Catch-all para cualquier otra ruta bajo /admin que no coincida */}
        <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  );
}

export default AdminApp;