// RUTA: frontend/src/App.jsx (VERSIÓN "NEXUS - AUTH FLOW FIX")

import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useUserStore from './store/userStore';

// --- IMPORTS ---
import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
import MaintenanceScreen from './components/MaintenanceScreen';
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage'; // Corregido de FactoriesPage
import DepositHistoryPage from './pages/DepositHistoryPage'; // Corregido el nombre del componente
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
import AdminApp from './admin/AdminApp';

// [NEXUS AUTH FLOW FIX] - Se refactoriza completamente el inicializador.
const AppInitializer = () => {
    const { syncUserWithBackend } = useUserStore();
    // Usamos useRef para asegurar que la sincronización se ejecute solo una vez.
    const hasSynced = useRef(false);

    useEffect(() => {
        if (hasSynced.current) return;
        
        const tg = window.Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user?.id) {
            hasSynced.current = true;
            syncUserWithBackend(tg.initDataUnsafe.user);
        } else {
          // Si no hay datos de Telegram, podríamos querer desloguear o mostrar un error.
          // Por ahora, asumimos que esto solo ocurre en desarrollo.
          console.warn("No se encontraron datos de usuario de Telegram.");
          // Para evitar un bloqueo en desarrollo, forzamos la finalización de la carga.
          useUserStore.setState({ isLoadingAuth: false });
        }
    }, [syncUserWithBackend]);

    return null; // Este componente no renderiza nada.
};

function App() {
  const { isAuthenticated, isLoadingAuth, isMaintenanceMode, maintenanceMessage } = useUserStore();

  // Renderizado condicional basado en el estado del store.
  if (isMaintenanceMode) {
    return <MaintenanceScreen message={maintenanceMessage} />;
  }
  
  if (isLoadingAuth) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-dark-primary">
        <Loader text="Autenticando..." />
      </div>
    );
  }

  return (
    <Router>
      <AppInitializer />
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        
        {isAuthenticated ? (
          <>
            <Route element={<Layout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/deposit-history" element={<DepositHistoryPage />} />
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