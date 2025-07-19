// frontend/src/App.jsx (VERSIÓN RESTAURADA v25.0 - FALLO DE REFERIDOS CORREGIDO)
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';

// Componentes y Páginas (se mantienen todos sus imports)
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import AdminProtectedRoute from './components/layout/AdminProtectedRoute';
import Loader from './components/common/Loader';
import AuthErrorScreen from './components/AuthErrorScreen';
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

// ======================= INICIO DE LA ARQUITECTURA RESTAURADA =======================

// --- ANÁLISIS Y CAMBIOS v25.0 ---
// 1. Redireccionador de Referidos (SIMPLIFICADO)
// Se elimina la lógica de pasar el refCode por la URL. Esto era la causa de la condición de carrera.
// Su única responsabilidad ahora es sacar al usuario de la ruta raíz "/" y llevarlo a "/home".
function RootRedirector() {
  console.log('[v25.0 RootRedirector] Redirigiendo de / a /home.');
  return <Navigate to="/home" replace />;
}

// --- ANÁLISIS Y CAMBIOS v25.0 ---
// 2. Inicializador Global de Autenticación (CORREGIDO)
// El fallo de referidos se elimina aquí.
function AuthInitializer() {
    const { syncUserWithBackend, logout, isAuthenticated } = useUserStore();
    const location = useLocation();

    useEffect(() => {
        // La guarda que protege el flujo de admin se mantiene intacta. ES CRÍTICA.
        if (isAuthenticated || window.location.pathname.startsWith('/admin')) {
            return;
        }

        const tg = window.Telegram?.WebApp;
        if (tg && tg.initData) {
            tg.ready();
            
            // ======================== CORRECCIÓN DEFINITIVA DEL FALLO DE REFERIDOS ========================
            // Se elimina la lectura de `location.search`. Es inestable y causa la condición de carrera.
            // Se lee el `refCode` directamente de `start_param`, la fuente canónica de Telegram.
            // Esto garantiza que el `refCode` se capture siempre, sin depender de la redirección.
            const refCode = tg.initDataUnsafe.start_param || null;
            console.log(`[v25.0 AuthInitializer] Capturado refCode directamente de Telegram: ${refCode}`);
            // =============================================================================================

            syncUserWithBackend(tg.initDataUnsafe.user, refCode);
        } else {
             // La lógica para entornos no-Telegram se mantiene.
             if (!window.location.pathname.startsWith('/admin')) {
                console.log('[v25.0 AuthInitializer] Entorno no-Telegram detectado. Ejecutando logout.');
                logout();
             }
        }
    // La dependencia de `location.search` se ha eliminado para estabilizar el componente.
    }, [location.pathname, isAuthenticated, syncUserWithBackend, logout]);

    return null;
}

// --- ANÁLISIS Y CAMBIOS v25.0 ---
// 3. El Guardián de Roles (SIN CAMBIOS)
// Este componente funciona correctamente y es crucial para el flujo de admin. Se mantiene intacto.
function UserGatekeeper() {
    const { user, isAuthenticated, isLoadingAuth } = useUserStore();

    if (isLoadingAuth) {
        return <div className="w-full h-screen flex items-center justify-center bg-dark-primary"><Loader text="Autenticando..." /></div>;
    }
    if (!isAuthenticated) {
        return <AuthErrorScreen message="Autenticación requerida. Por favor, reinicia desde Telegram." />;
    }
    if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }
    return <Layout />;
}

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      {/* El inicializador sigue ejecutándose a nivel global */}
      <AuthInitializer />

      <Routes>
        {/* La ruta raíz activa el redireccionador simplificado */}
        <Route path="/" element={<RootRedirector />} />
        
        {/* El guardián sigue protegiendo las rutas de usuario */}
        <Route element={<UserGatekeeper />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        {/* Todas sus demás rutas se mantienen intactas y seguras */}
        <Route path="/language" element={<LanguagePage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/history" element={<FinancialHistoryPage />} />
        <Route path="/crypto-selection" element={<CryptoSelectionPage />} />
        
        {/* El flujo de admin no ha sido alterado */}
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

export default App;