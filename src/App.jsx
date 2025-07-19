// frontend/src/App.jsx (VERSIÓN ESTABILIZACIÓN TOTAL Y DEFINITIVA v25.2)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import AdminProtectedRoute from './components/layout/AdminProtectedRoute';

// Páginas App de Usuario
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

// Páginas Panel de Administración
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

// Componente "puente" que captura el parámetro de referido y redirige.
function RootRedirector() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const refCode = searchParams.get('startapp');
  const destination = refCode ? `/home?refCode=${refCode}` : '/home';
  return <Navigate to={destination} replace />;
}

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* ======================= INICIO DE LA ESTRUCTURA DE RUTAS FINAL ======================= */}

        {/* 1. La ruta raíz (/) ahora usa nuestro interceptor. Es el único punto de entrada. */}
        <Route path="/" element={<RootRedirector />} />
        
        {/* 2. Rutas de Usuario envueltas en el Layout principal (con barra de navegación inferior) */}
        <Route element={<Layout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* 3. Rutas de Usuario que son páginas completas y no usan el Layout principal. */}
        <Route path="/language" element={<LanguagePage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/history" element={<FinancialHistoryPage />} />
        <Route path="/crypto-selection" element={<CryptoSelectionPage />} />
        
        {/* 4. Rutas de Administración */}
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
            {/* Ruta por defecto para /admin */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>
        
        {/* 5. Ruta para capturar cualquier otra URL no definida */}
        <Route path="*" element={<NotFoundPage />} />

        {/* ======================== FIN DE LA ESTRUCTURA DE RUTAS FINAL ========================= */}
      </Routes>
    </Router>
  );
}

export default App;