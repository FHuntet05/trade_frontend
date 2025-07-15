// frontend/src/App.jsx (VERSIÓN 100% COMPLETA Y FUNCIONAL)

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

// Páginas App de Usuario (Importaciones completas)
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

// Páginas Panel de Administración (Importaciones completas)
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';

/**
 * Componente que encapsula TODA la lógica y rutas de la Mini App de Telegram.
 * Se renderiza solo si la URL no empieza con /admin.
 */
function UserAppShell() {
  const { isAuthenticated, isLoadingAuth } = useUserStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isLoadingAuth: state.isLoadingAuth,
  }));

  if (isLoadingAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-dark-primary">
        <Loader text="Conectando..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthErrorScreen message={"No se pudo conectar. Por favor, reinicia la Mini App desde Telegram."} />;
  }

  // Rutas completas de la aplicación de usuario
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

/**
 * El componente principal de la aplicación. Actúa como un enrutador maestro.
 */
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
        {/* --- RUTAS DEL PANEL DE ADMINISTRACIÓN --- */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>

        {/* --- RUTAS DE LA MINI APP DE TELEGRAM --- */}
        <Route path="/*" element={<UserAppShell />} />
      </Routes>
    </Router>
  );
}

export default App;