// frontend/src/App.jsx (CÓDIGO RECONSTRUIDO CON EL INTERCEPTOR)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';

import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import AdminProtectedRoute from './components/layout/AdminProtectedRoute';
import Loader from './components/common/Loader';
import AuthErrorScreen from './components/AuthErrorScreen';
import MaintenanceScreen from './components/MaintenanceScreen';
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage';
import RankingPage from './pages/RankingPage';
import TeamPage from './pages/TeamPage';
import ProfilePage from './pages/ProfilePage';
import LanguagePage from './pages/LanguagePage';
import NotFoundPage from './pages/NotFoundPage';
import FaqPage from './pages/FaqPage';
import AboutPage from './pages/AboutPage';
import SupportPage from './pages/SupportPage';
import FinancialHistoryPage from './pages/FinancialHistoryPage';
import CryptoSelectionPage from './pages/CryptoSelectionPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage';
import AdminToolsPage from './pages/admin/AdminToolsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminSecurityPage from './pages/admin/AdminSecurityPage';
import AdminTreasuryPage from './pages/admin/AdminTreasuryPage';
import SweepControlPage from './pages/admin/SweepControlPage';
import GasDispenserPage from './pages/admin/GasDispenserPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage'; 
import AdminBlockchainMonitorPage from './pages/admin/AdminBlockchainMonitorPage';

// =======================================================================
// === EL INTERCEPTOR DE URL (ROL: INTERCEPTOR) ===
// =======================================================================
function RootInterceptor() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const refCode = searchParams.get('startapp'); // Captura el parámetro de la Pasarela (bot)
  
  // Construye la URL de destino limpia, pasando el refCode si existe.
  const destination = `/home${refCode ? `?ref=${refCode}` : ''}`;
  console.log(`[Interceptor] Redirigiendo de '${location.pathname}${location.search}' a '${destination}'`);

  // Redirige de forma permanente, reemplazando la entrada en el historial.
  return <Navigate to={destination} replace />;
}

// =======================================================================
// === EL CONTENEDOR DE LA APP (SHELL) ===
// =======================================================================
function UserAppShell() {
  const { isAuthenticated, isLoadingAuth, user, settings } = useUserStore();

  // 1. Muestra el loader MIENTRAS se realiza la sincronización inicial.
  if (isLoadingAuth) {
    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-dark-primary">
            <Loader text="Conectando..." />
        </div>
    );
  }

  // 2. Si la sincronización falla, isAuthenticated será false. Muestra un error claro.
  if (!isAuthenticated) {
    return <AuthErrorScreen message={"No se pudo conectar. Por favor, reinicia la Mini App desde Telegram."} />;
  }
  
  // 3. Redirige a los administradores a su panel.
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 4. Muestra la pantalla de mantenimiento si está activado.
  if (settings?.maintenanceMode) {
    return <MaintenanceScreen message={settings.maintenanceMessage} />;
  }

  // 5. Si todo es correcto, renderiza las rutas de la aplicación de usuario.
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tools" element={<ToolsPage />} />
        <Route path="ranking" element={<RankingPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      {/* Rutas fuera del layout principal */}
      <Route path="/language" element={<LanguagePage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/history" element={<FinancialHistoryPage />} />
      <Route path="/crypto-selection" element={<CryptoSelectionPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Rutas de Administrador */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
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
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>

        {/* --- RUTAS DE LA APLICACIÓN DE USUARIO --- */}
        {/* La ruta raíz (/) ahora es manejada EXCLUSIVAMENTE por el Interceptor */}
        <Route path="/" element={<RootInterceptor />} />
        
        {/* Todas las rutas de la aplicación de usuario viven bajo /home/ y están protegidas por el UserAppShell */}
        <Route path="/home/*" element={<UserAppShell />} />

      </Routes>
    </Router>
  );
}

export default App;