// frontend/src/App.jsx (VERSIÓN TRASPLANTE v26.0)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';

// Componentes y Páginas
import Layout from './components/layout/Layout'; // Asumimos que Layout maneja la estructura principal
import AdminLayout from './components/layout/AdminLayout';
import AdminProtectedRoute from './components/layout/AdminProtectedRoute';
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

// --- ANÁLISIS Y CAMBIOS v26.0 ---
// Se crea un componente simple que redirige a los administradores si están logueados
// y renderiza el Layout normal para los usuarios. Esto protege las rutas de usuario.
const UserRedirector = () => {
    const { user, isAuthenticated } = useUserStore();

    // Si el usuario está autenticado y es admin, lo sacamos de las rutas de usuario
    // y lo mandamos al dashboard de admin.
    if (isAuthenticated && user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }
    
    // Si es un usuario normal, renderiza el Layout que contiene las páginas.
    return <Layout />;
};


function App() {
  // La lógica de inicialización global ha sido eliminada.
  // App.jsx ahora es un simple definidor de rutas.
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* Ruta raíz redirige a /home para mantener consistencia */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Todas las rutas de usuario están ahora anidadas bajo un Layout */}
        {/* El UserRedirector decide si mostrar el Layout o redirigir al admin */}
        <Route element={<UserRedirector />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        {/* Rutas sin el layout principal (ej. selector de idioma en un modal) */}
        <Route path="/language" element={<LanguagePage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/history" element={<FinancialHistoryPage />} />
        <Route path="/crypto-selection" element={<CryptoSelectionPage />} />
        
        {/* El flujo de admin se mantiene intacto y separado */}
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