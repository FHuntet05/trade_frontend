// RUTA: frontend/src/App.jsx (VERSIÓN "NEXUS - MAINTENANCE AWARE")

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useUserStore from './store/userStore';
import { Toaster } from 'react-hot-toast';

// --- IMPORTS ---
import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
import MaintenanceScreen from './components/MaintenanceScreen'; // <-- 1. Importar la nueva pantalla
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage'; // Se corrige de FactoriesPage a ToolsPage
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
import DepositDetailsPage from './pages/DepositDetailsPage';

// --- COMPONENTES DE ADMINISTRACIÓN (Se mantienen por si se necesita una ruta unificada en el futuro) ---
import AdminApp from './admin/AdminApp';

// [NEXUS MAINTENANCE AWARE] - Se refactoriza AppInitializer
// Ahora solo se encarga de disparar la sincronización.
const AppInitializer = () => {
    const { isAuthenticated, syncUserWithBackend } = useUserStore();
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!isAuthenticated && tg?.initDataUnsafe?.user?.id) {
            syncUserWithBackend(tg.initDataUnsafe.user);
        }
    }, [isAuthenticated, syncUserWithBackend]);
    return null;
};

function App() {
  // [NEXUS MAINTENANCE AWARE] - Lógica de renderizado principal movida aquí.
  const { isAuthenticated, isLoadingAuth, isMaintenanceMode, maintenanceMessage } = useUserStore();

  // Caso 1: La app está en modo mantenimiento (detectado desde la API).
  if (isMaintenanceMode) {
    return <MaintenanceScreen message={maintenanceMessage} />;
  }
  
  // Caso 2: La app está en proceso de autenticación inicial.
  if (isLoadingAuth) { 
    return (
      <div className="w-full h-screen flex items-center justify-center bg-dark-primary">
        <Loader text="Autenticando..." />
      </div>
    ); 
  }

  // Caso 3: La autenticación ha finalizado.
  return (
    <Router>
      <Toaster position="top-center" />
      <AppInitializer />
      <Routes>
        {isAuthenticated ? (
          // Si está autenticado, muestra la aplicación completa.
          <>
            <Route element={<Layout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/history" element={<FinancialHistoryPage />} />
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
        ) : (
          // Si no está autenticado (y no está cargando ni en mantenimiento), muestra un error.
          <Route path="*" element={
            <div className="w-full h-screen flex items-center justify-center p-4 bg-dark-primary text-text-secondary text-center">
              Error de autenticación.<br/>Por favor, reinicia la app desde Telegram.
            </div>
          } />
        )}
        
        {/* Las rutas de admin ahora se manejan en un archivo separado para mayor claridad */}
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </Router>
  );
}

export default App;