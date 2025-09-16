// RUTA: frontend/src/App.jsx (VERSIÓN "NEXUS - FINAL SIMPLIFIED")

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
import FinancialHistoryPage from './pages/FinancialHistoryPage';
import TeamPage from './pages/TeamPage';
import ProfilePage from './pages/ProfilePage';
import LanguagePage from './pages/LanguagePage';
import NotFoundPage from './pages/NotFoundPage';
// ... (otros imports de páginas)
import AdminApp from './admin/AdminApp';

// Este componente dispara la sincronización una sola vez.
const AppInitializer = () => {
    const { fetchUserSession } = useUserStore();
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        // Siempre intentamos obtener la sesión, pasamos los datos de telegram si existen.
        fetchUserSession(tg?.initDataUnsafe?.user); 
    }, [fetchUserSession]);
    return null;
};

// Rutas de la aplicación de usuario.
const UserRoutes = () => (
    <>
        <Route element={<Layout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/history" element={<FinancialHistoryPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* ... (otras rutas de usuario) */}
        </Route>
        <Route path="/language" element={<LanguagePage />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<NotFoundPage />} />
    </>
);

function App() {
  const { isAuthenticated, isLoadingAuth, isMaintenanceMode } = useUserStore();
  
  return (
    <Router>
      <Toaster position="top-center" />
      <AppInitializer />
      
      {/* Lógica de renderizado principal y centralizada */}
      {isLoadingAuth ? (
        <div className="w-full h-screen flex items-center justify-center bg-dark-primary">
          <Loader text="Autenticando..." />
        </div>
      ) : isMaintenanceMode ? (
        <MaintenanceScreen />
      ) : (
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
      )}
    </Router>
  );
}

export default App;