// frontend/src/App.jsx (VERSIÓN RESTAURACIÓN TOTAL v33.0)
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';

// --- IMPORTS COMPLETOS DE COMPONENTES Y PÁGINAS ---
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import AdminProtectedRoute from './components/layout/AdminProtectedRoute';
import Loader from './components/common/Loader'; // Asumiendo que existe en esta ruta
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

// --- COMPONENTE 1: INICIALIZADOR GLOBAL SILENCIOSO ---
// Su única misión es detonar la sincronización si no estamos autenticados.
// Se ejecuta en todas las rutas de usuario, pero no en las de admin.
const AppInitializer = () => {
    const { isAuthenticated, syncUserWithBackend } = useUserStore();
    
    useEffect(() => {
        // Si ya estamos autenticados (gracias al token persistente), no hacemos nada.
        if (isAuthenticated) return;
        
        const tg = window.Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user?.id) {
            console.log('[AppInitializer] No autenticado, iniciando sincronización...');
            // Llama a la función del store que ya no maneja refCode.
            syncUserWithBackend(tg.initDataUnsafe.user);
        }
    }, [isAuthenticated, syncUserWithBackend]);

    return null; // Es invisible, no renderiza nada.
};

// --- COMPONENTE 2: GUARDIÁN DE RUTAS Y PANTALLA DE CARGA ---
// Este componente decide qué mostrar: un loader, un error, o las páginas de usuario.
// También redirige a los administradores al panel correcto.
const UserGatekeeper = ({ children }) => {
    const { user, isAuthenticated, isLoadingAuth } = useUserStore();

    // Prioridad 1: Mostrar loader a pantalla completa mientras se autentica.
    if (isLoadingAuth) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-dark-primary" style={{
                // Asumiendo que el fondo de TeamPage es un degradado o imagen
                background: 'var(--background-main)' // Asegúrate de que esta variable CSS esté definida globalmente
            }}>
                <Loader text="Autenticando..." />
            </div>
        );
    }

    // Prioridad 2: Si no estamos autenticados después de la carga, es un error.
    if (!isAuthenticated) {
        return (
            <div className="w-full h-screen flex items-center justify-center p-4 bg-dark-primary">
                Error de autenticación. Por favor, reinicia la app desde Telegram.
            </div>
        );
    }
    
    // Prioridad 3: Si el usuario es admin, redirigir al dashboard.
    // Esto se verifica DESPUÉS de la carga para asegurar que el rol del usuario está disponible.
    if (user && user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Si todo está bien y el usuario es normal, renderiza los hijos (el Layout con las páginas).
    return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      {/* El inicializador ahora envuelve a las rutas de usuario para ejecutarse en el contexto correcto */}
      
      <Routes>
        {/* Las rutas de admin no tienen el inicializador de usuario */}
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

        {/* Todas las demás rutas son de usuario y necesitan inicialización y protección */}
        <Route path="/*" element={
          <>
            <AppInitializer />
            <UserGatekeeper>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                {/* Todas las páginas de usuario viven dentro del Layout para consistencia de UI */}
                <Route element={<Layout />}>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/tools" element={<ToolsPage />} />
                  <Route path="/ranking" element={<RankingPage />} />
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  {/* CORRECCIÓN DE UI: Páginas ahora dentro del Layout */}
                  <Route path="/history" element={<FinancialHistoryPage />} />
                  <Route path="/crypto-selection" element={<CryptoSelectionPage />} />
                </Route>
                
                {/* Rutas independientes sin el Layout principal */}
                <Route path="/language" element={<LanguagePage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/support" element={<SupportPage />} />
                
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </UserGatekeeper>
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;