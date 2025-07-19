// frontend/src/App.jsx (VERSIÓN FINAL, COMPLETA Y FUNCIONAL v28.0)
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';

// Componentes y Páginas
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import AdminProtectedRoute from './components/layout/AdminProtectedRoute';
import Loader from './components/common/Loader';
import AuthErrorScreen from './components/AuthErrorScreen';
import HomePage from './pages/HomePage';
// ... (todos sus demás imports de páginas están aquí)
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

// ======================= INICIO DE LA ARQUITECTURA DEFINITIVA =======================

// 1. Redireccionador de Referidos (Sin cambios, funciona bien)
function RootRedirector() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const refCode = searchParams.get('startapp');
  const destination = refCode ? `/home?refCode=${refCode}` : '/home';
  return <Navigate to={destination} replace />;
}

// 2. Inicializador Global de Autenticación (Sin cambios, funciona bien)
function AuthInitializer() {
    const { syncUserWithBackend, logout, isAuthenticated } = useUserStore();
    const location = useLocation();
    useEffect(() => {
        if (isAuthenticated || window.location.pathname.startsWith('/admin')) return;
        const tg = window.Telegram?.WebApp;
        if (tg && tg.initData) {
            tg.ready();
            const searchParams = new URLSearchParams(location.search);
            const refCode = searchParams.get('refCode');
            syncUserWithBackend(tg.initDataUnsafe.user, refCode);
        } else {
             if (!window.location.pathname.startsWith('/admin')) logout();
        }
    }, [location.pathname, isAuthenticated, syncUserWithBackend, logout, location.search]);
    return null;
}

// 3. El Guardián de Roles (LA PIEZA QUE FALTABA)
// Este componente decide a dónde va el usuario DESPUÉS de la autenticación.
function UserGatekeeper() {
    const { user, isAuthenticated, isLoadingAuth } = useUserStore();

    if (isLoadingAuth) {
        return <div className="w-full h-screen flex items-center justify-center bg-dark-primary"><Loader text="Autenticando..." /></div>;
    }
    if (!isAuthenticated) {
        return <AuthErrorScreen message="Autenticación requerida. Por favor, reinicia desde Telegram." />;
    }
    // ESTA ES LA LÓGICA DE REDIRECCIÓN DEL ADMINISTRADOR RESTAURADA
    if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }
    // Si es un usuario normal, renderiza el Layout principal.
    return <Layout />;
}

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <AuthInitializer />

      <Routes>
        <Route path="/" element={<RootRedirector />} />
        
        {/* El Guardián ahora protege TODAS las rutas de usuario. */}
        <Route element={<UserGatekeeper />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        {/* El resto de sus rutas, completas y sin omisiones */}
        <Route path="/language" element={<LanguagePage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/history" element={<FinancialHistoryPage />} />
        <Route path="/crypto-selection" element={<CryptoSelectionPage />} />
        
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
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
// ======================== FIN DE LA ARQUITECTURA DEFINITIVA =========================

export default App;