// RUTA: frontend/src/App.jsx (VERSIÓN "NEXUS - STABLE AUTH")

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useUserStore from './store/userStore';
import { Toaster } from 'react-hot-toast';

// --- IMPORTS ---
import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
import MaintenanceScreen from './components/MaintenanceScreen';
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage';
// [NEXUS STABLE AUTH - FIX] Se corrige la ruta de importación.
import FinancialHistoryPage from './pages/FinancialHistoryPage';
import TeamPage from './pages/TeamPage';
import ProfilePage from './pages/ProfilePage';
import LanguagePage from './pages/LanguagePage';
import NotFoundPage from './pages/NotFoundPage';
import FaqPage from './pages/FaqPage';
import AboutPage from './pages/AboutPage';
import SupportPage from './pages/SupportPage';
import CryptoSelectionPage from './pages/CryptoSelectionPage';
import DepositDetailsPage from './pages/DepositDetailsPage';
import AdminApp from './admin/AdminApp';

// Este componente ahora solo se encarga de disparar la sincronización una vez.
const AppInitializer = () => {
    const { syncUserWithBackend, token } = useUserStore();
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!token && tg?.initDataUnsafe?.user?.id) {
            syncUserWithBackend(tg.initDataUnsafe.user);
        } else if (token) {
          // Si ya tenemos token de localStorage, terminamos la carga.
          useUserStore.setState({ isLoadingAuth: false });
        }
    }, [token, syncUserWithBackend]);
    return null;
};

// Rutas protegidas de la aplicación de usuario
const UserRoutes = () => (
    <>
        <Route element={<Layout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/history" element={<FinancialHistoryPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/crypto-selection" element={<CryptoSelectionPage />} />
            <Route path="/deposit-details" element={<DepositDetailsPage />} />
        </Route>
        <Route path="/language" element={<LanguagePage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<NotFoundPage />} />
    </>
);

function App() {
  const { isAuthenticated, isLoadingAuth, isMaintenanceMode, maintenanceMessage, _hasHydrated } = useUserStore();
  
  // Caso 0: Aún no hemos leído desde localStorage. Mostramos un loader genérico.
  if (!_hasHydrated) {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-dark-primary">
            <Loader text="Inicializando..." />
        </div>
    );
  }

  // Caso 1: Modo Mantenimiento.
  if (isMaintenanceMode) {
    return <MaintenanceScreen message={maintenanceMessage} />;
  }
  
  // Caso 2: Autenticación inicial en proceso.
  if (isLoadingAuth) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-dark-primary">
        <Loader text="Autenticando..." />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" />
      <AppInitializer />
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        
        {isAuthenticated ? (
          <UserRoutes />
        ) : (
          <Route path="*" element={
            <div className="w-full h-screen flex items-center justify-center p-4 bg-dark-primary text-text-secondary text-center">
              Error de autenticación.<br/>Por favor, reinicia la app desde Telegram.
            </div>
          } />
        )}
      </Routes>
    </Router>
  );
}

export default App;