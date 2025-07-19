// frontend/src/App.jsx (VERSIÓN CON REFERIDOS BLINDADOS v24.0)
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';

// ... (resto de imports de Layouts, Componentes y Páginas sin cambios)
// Layouts y Componentes
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import AdminProtectedRoute from './components/layout/AdminProtectedRoute';
import Loader from './components/common/Loader';
import AuthErrorScreen from './components/AuthErrorScreen';
import MaintenanceScreen from './components/MaintenanceScreen';

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


function UserAppShell() {
  const { user, isAuthenticated, isLoadingAuth, settings } = useUserStore((state) => ({
    user: state.user, isAuthenticated: state.isAuthenticated,
    isLoadingAuth: state.isLoadingAuth, settings: state.settings,
  }));
  if (isLoadingAuth) { return (<div className="w-full min-h-screen flex items-center justify-center bg-dark-primary"><Loader text="Conectando..." /></div>); }
  if (!isAuthenticated) { return <AuthErrorScreen message={"No se pudo conectar. Por favor, reinicia la Mini App desde Telegram."} />; }
  if (user?.role === 'admin') { return <Navigate to="/admin/dashboard" replace />; }
  if (settings?.maintenanceMode) { return <MaintenanceScreen message={settings.maintenanceMessage} />; }
  return (
    <Routes>
      <Route path="/" element={<Layout />}><Route index element={<Navigate to="/home" replace />} /><Route path="home" element={<HomePage />} /><Route path="tools" element={<ToolsPage />} /><Route path="ranking" element={<RankingPage />} /><Route path="team" element={<TeamPage />} /><Route path="profile" element={<ProfilePage />} /></Route>
      <Route path="/language" element={<LanguagePage />} /><Route path="/faq" element={<FaqPage />} /><Route path="/about" element={<AboutPage />} /><Route path="/support" element={<SupportPage />} /><Route path="/history" element={<FinancialHistoryPage />} /><Route path="/crypto-selection" element={<CryptoSelectionPage />} /><Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

// ======================= INICIO CORRECCIÓN ARQUITECTURAL DE REFERIDOS =======================
function AuthInitializer() {
  const syncUser = useUserStore((state) => state.syncUserWithBackend);
  const logout = useUserStore((state) => state.logout);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.initData) {
      tg.ready();
      tg.expand();
      
      // CORRECCIÓN: La única fuente de verdad para el código de referido es `start_param`.
      const refCode = tg.initDataUnsafe?.start_param || null;

      if (refCode) {
        console.log(`[Auth] Código de referido oficial (start_param) detectado: ${refCode}`);
      }

      // Pasamos el objeto de usuario completo y el código de referido.
      syncUser(tg.initDataUnsafe.user, refCode);

    } else {
      console.error("Telegram WebApp no está disponible. Entorno no válido.");
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function App() {
  return (
    <Router>
      <AuthInitializer />
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<AdminProtectedRoute />}><Route element={<AdminLayout />}><Route path="/admin/dashboard" element={<AdminDashboardPage />} /><Route path="/admin/users" element={<AdminUsersPage />} /><Route path="/admin/users/:id/details" element={<AdminUserDetailPage />} /><Route path="/admin/transactions" element={<AdminTransactionsPage />} /><Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} /><Route path="/admin/tools" element={<AdminToolsPage />} /><Route path="/admin/security" element={<AdminSecurityPage />} /><Route path="/admin/settings" element={<AdminSettingsPage />} /><Route path="/admin/treasury" element={<AdminTreasuryPage />} /><Route path="/admin/notifications" element={<AdminNotificationsPage />} /><Route path="/admin/sweep-control" element={<SweepControlPage />} /><Route path="/admin/gas-dispenser" element={<GasDispenserPage />} /><Route path="/admin/blockchain-monitor" element={<AdminBlockchainMonitorPage />} /><Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} /></Route></Route>
        <Route path="/*" element={<UserAppShell />} />
      </Routes>
    </Router>
  );
}
// ======================== FIN CORRECCIÓN ARQUITECTURAL DE REFERIDOS =========================

export default App;