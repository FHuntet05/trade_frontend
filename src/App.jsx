// RUTA: frontend/src/App.jsx (VERSIÓN "NEXUS - SPLASH SCREEN INTEGRATION")
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';

// --- IMPORTACIONES DE COMPONENTES Y PÁGINAS ---
import Layout from './components/layout/Layout';
import AuthLoadingPage from './pages/AuthLoadingPage'; // [NEXUS UX] - Importamos la nueva pantalla de carga
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
import DepositDetailsPage from './pages/DepositDetailsPage';

// --- COMPONENTES AUXILIARES ---

const AppInitializer = () => { 
  const { isAuthenticated, syncUserWithBackend } = useUserStore(); 
  useEffect(() => { 
    if (isAuthenticated) return; 
    const tg = window.Telegram?.WebApp; 
    if (tg?.initDataUnsafe?.user?.id) { 
      syncUserWithBackend(tg.initDataUnsafe.user); 
    } 
  }, [isAuthenticated, syncUserWithBackend]); 
  return null; 
};

// Protege las rutas y ahora muestra la nueva splash screen.
const UserGatekeeper = ({ children }) => { 
  const { isAuthenticated, isLoadingAuth } = useUserStore(); 
  
  if (isLoadingAuth) { 
    // [NEXUS UX] - Se reemplaza el loader genérico por la nueva página de carga.
    return <AuthLoadingPage />;
  } 
  
  if (!isAuthenticated) { 
    return ( 
      <div className="w-full h-screen flex flex-col items-center justify-center text-center p-4 bg-dark-primary text-white">
        <h2 className="text-xl font-bold text-red-400">Error de Autenticación</h2>
        <p className="text-text-secondary mt-2">No se pudo verificar tu sesión. Por favor, reinicia la aplicación desde Telegram.</p>
      </div> 
    ); 
  } 
  
  return children; 
};

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <AppInitializer />
      <UserGatekeeper>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          
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
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </UserGatekeeper>
    </Router>
  );
}

export default App;