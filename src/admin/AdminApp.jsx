// RUTA: frontend/src/admin/AdminApp.jsx (VERSIÓN "NEXUS - GUARDIAN")
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// [NEXUS GUARDIAN] Importamos el store y el loader.
import useAdminStore from '../store/adminStore';
import Loader from '../components/common/Loader';

// Componentes del Layout y Páginas (sin cambios en las importaciones)
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


// [NEXUS GUARDIAN - NUEVO COMPONENTE]
// Este componente interno encapsula las rutas protegidas.
// Solo se renderizará si la autenticación es exitosa.
const ProtectedRoutes = () => (
  <Routes>
    <Route element={<AdminLayout />}>
      <Route path="/dashboard" element={<AdminDashboardPage />} />
      <Route path="/users" element={<AdminUsersPage />} />
      {/* [NEXUS GUARDIAN - CORRECCIÓN DE RUTA] Se elimina el /details sobrante */}
      <Route path="/users/:id" element={<AdminUserDetailPage />} /> 
      <Route path="/transactions" element={<AdminTransactionsPage />} />
      <Route path="/withdrawals" element={<AdminWithdrawalsPage />} />
      <Route path="/tools" element={<AdminToolsPage />} />
      <Route path="/security" element={<AdminSecurityPage />} />
      <Route path="/settings" element={<AdminSettingsPage />} />
      <Route path="/treasury" element={<AdminTreasuryPage />} />
      <Route path="/notifications" element={<AdminNotificationsPage />} />
      <Route path="/sweep-control" element={<SweepControlPage />} />
      <Route path="/gas-dispenser" element={<GasDispenserPage />} />
      <Route path="/blockchain-monitor" element={<AdminBlockchainMonitorPage />} />
      {/* Redirección base */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Route>
    {/* Catch-all para cualquier ruta no encontrada dentro del admin */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);


function AdminApp() {
  // [NEXUS GUARDIAN] Nos suscribimos a los estados clave del store.
  const { isAuthenticated, _hasHydrated } = useAdminStore();

  // Caso 1: Aún no hemos terminado de leer desde localStorage.
  // Mostramos un loader global para prevenir cualquier renderizado.
  if (!_hasHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-dark-primary">
        <Loader text="Cargando aplicación..." />
      </div>
    );
  }

  // Caso 2: La hidratación terminó. Renderizamos el Router.
  // La lógica interna decidirá qué mostrar.
  return (
    <Router basename="/admin">
      <Toaster position="top-center" reverseOrder={false} />
      {isAuthenticated ? (
        // Si estamos autenticados, renderizamos las rutas protegidas.
        <ProtectedRoutes />
      ) : (
        // Si NO estamos autenticados, solo permitimos acceso a /login.
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          {/* Cualquier otra ruta redirige a /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default AdminApp;