// frontend/src/App.jsx (VERSIÓN COMPLETA Y FINAL - CON REDIRECCIÓN DE ADMIN)

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';

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
import RechargePage from './pages/RechargePage';
import NotFoundPage from './pages/NotFoundPage';
import FaqPage from './pages/FaqPage';
import AboutPage from './pages/AboutPage';
import SupportPage from './pages/SupportPage';
import FinancialHistoryPage from './pages/FinancialHistoryPage';

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

function UserAppShell() {
  const { user, isAuthenticated, isLoadingAuth, settings } = useUserStore((state) => ({
    user: state.user, // Obtenemos el objeto de usuario completo para chequear el rol
    isAuthenticated: state.isAuthenticated,
    isLoadingAuth: state.isLoadingAuth,
    settings: state.settings,
  }));

  // Muestra el cargador mientras se autentica
  if (isLoadingAuth || (!settings && isAuthenticated)) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-dark-primary">
        <Loader text="Conectando..." />
      </div>
    );
  }
  
  // --- LÓGICA DE REDIRECCIÓN PARA ADMINISTRADORES ---
  // Si el usuario está autenticado y su rol es 'admin', lo redirige al panel.
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Muestra la pantalla de mantenimiento si está activada
  if (settings?.maintenanceMode) {
    return <MaintenanceScreen message={settings.maintenanceMessage} />;
  }

  // Muestra un error si no se pudo autenticar
  if (!isAuthenticated) {
    return <AuthErrorScreen message={"No se pudo conectar. Por favor, reinicia la Mini App desde Telegram."} />;
  }

  // Si es un usuario normal y todo está bien, muestra la app de usuario.
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tools" element={<ToolsPage />} />
        <Route path="ranking" element={<RankingPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="/language" element={<LanguagePage />} />
      <Route path="/recharge" element={<RechargePage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/history" element={<FinancialHistoryPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  const initializeAuth = useUserStore((state) => state.login);
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.initData) {
      initializeAuth({ initData: tg.initData, startParam: tg.initDataUnsafe?.start_param });
    } else {
      useUserStore.getState().logout();
    }
  }, [initializeAuth]);

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Rutas públicas o con su propia lógica de protección */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        {/* Rutas de Administrador protegidas */}
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
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>
        
        {/* Ruta principal que maneja la lógica de usuario/admin */}
        <Route path="/*" element={<UserAppShell />} />
      </Routes>
    </Router>
  );
}

export default App;