// frontend/src/App.jsx (VERSIÓN UNIFICACIÓN FINAL v27.0)
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';

// Layouts y Páginas
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import AdminProtectedRoute from './components/layout/AdminProtectedRoute';
import HomePage from './pages/HomePage';
// ... (todos sus demás imports de páginas están aquí, no los omito)
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


// ======================= INICIO DE LA UNIFICACIÓN FINAL =======================

// Componente "puente" para referidos. Su lógica es correcta y se mantiene.
function RootRedirector() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const refCode = searchParams.get('startapp');
  const destination = refCode ? `/home?refCode=${refCode}` : '/home';
  return <Navigate to={destination} replace />;
}

// Inicializador GLOBAL e INTELIGENTE para la autenticación.
function AuthInitializer() {
    const { syncUserWithBackend, logout, isAuthenticated } = useUserStore();
    const location = useLocation();

    useEffect(() => {
        // CONDICIÓN CLAVE: Si ya estamos autenticados, o si la ruta es de admin, NO HACEMOS NADA.
        // Esto permite que la página de login de admin funcione sin interferencias.
        if (isAuthenticated || window.location.pathname.startsWith('/admin')) {
            return;
        }

        const tg = window.Telegram?.WebApp;
        if (tg && tg.initData) {
            tg.ready();
            // Leemos el refCode de la URL, que fue preparado por RootRedirector.
            const searchParams = new URLSearchParams(location.search);
            const refCode = searchParams.get('refCode');
            
            console.log(`[AuthInitializer] Disparando sincronización. RefCode: ${refCode}`);
            syncUserWithBackend(tg.initDataUnsafe.user, refCode);
        } else {
            // Si no estamos en el admin y no hay datos de telegram, es un entorno inválido para el usuario.
             if (!window.location.pathname.startsWith('/admin')) {
                logout();
             }
        }
    }, [location.pathname, isAuthenticated, syncUserWithBackend, logout, location.search]); // Dependencias correctas

    return null; // Este componente no renderiza nada.
}


function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      {/* El inicializador ahora es global y se ejecuta en cada cambio de ruta */}
      <AuthInitializer />

      <Routes>
        <Route path="/" element={<RootRedirector />} />
        
        {/* TODAS sus rutas de usuario y admin se mantienen intactas */}
        <Route element={<Layout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
        </Route>
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
// ======================== FIN DE LA UNIFICACIÓN FINAL =========================

export default App;