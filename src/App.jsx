// RUTA: frontend/src/App.jsx (VERSIÓN "NEXUS - FINAL STABLE")

import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useUserStore from './store/userStore';
import { Toaster } from 'react-hot-toast'; // Asegúrate de que Toaster esté aquí si no lo tienes.

// --- IMPORTS ---
import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
import MaintenanceScreen from './components/MaintenanceScreen';
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage'; // Nombre corregido
import FinancialHistoryPage from './pages/FinancialHistoryPage'; // Nombre corregido
import TeamPage from './pages/TeamPage';
import ProfilePage from './pages/ProfilePage';
import LanguagePage from './pages/LanguagePage';
import NotFoundPage from './pages/NotFoundPage';
import FaqPage from './pages/FaqPage';
import AboutPage from './pages/AboutPage';
import SupportPage from './pages/SupportPage';
import CryptoSelectionPage from './pages/CryptoSelectionPage';
import DepositDetailsPage from './pages/DepositDetailsPage';
import AdminApp from './admin/AdminApp'; // Se asume que AdminApp maneja sus propias rutas y lógica.

// Este componente dispara la sincronización inicial una sola vez.
const AppInitializer = () => {
    const { syncUserWithBackend, token, isLoadingAuth } = useUserStore();
    const isSyncing = useRef(false);

    useEffect(() => {
        if (isSyncing.current || token) {
            // Si ya tenemos un token (de localStorage), no necesitamos sincronizar.
            // La carga terminará una vez que el estado se hidrate.
            if (useUserStore.getState().isLoadingAuth) {
                useUserStore.setState({ isLoadingAuth: false });
            }
            return;
        }

        const tg = window.Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user?.id) {
            isSyncing.current = true;
            syncUserWithBackend(tg.initDataUnsafe.user);
        } else {
            // Si no hay datos de Telegram, forzamos el fin de la carga.
            useUserStore.setState({ isLoadingAuth: false });
        }
    }, [token, syncUserWithBackend]);

    return null;
};

// Rutas protegidas de la aplicación de usuario, para mantener el código limpio.
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
  const { isAuthenticated, isLoadingAuth, isMaintenanceMode, maintenanceMessage } = useUserStore();
  
  // La lógica de renderizado ahora es el "Guardián Raíz".
  const renderContent = () => {
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

    // Si la carga terminó, decidimos qué rutas mostrar.
    return (
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
    );
  };

  return (
    <Router>
      <Toaster position="top-center" />
      <AppInitializer />
      {renderContent()}
    </Router>
  );
}

export default App;