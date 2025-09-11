// frontend/src/App.jsx (VERSIÓN SIMPLIFICADA - SOLO BOT)
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';

import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
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

const AppInitializer = () => { const { isAuthenticated, syncUserWithBackend } = useUserStore(); useEffect(() => { if (isAuthenticated) return; const tg = window.Telegram?.WebApp; if (tg?.initDataUnsafe?.user?.id) { syncUserWithBackend(tg.initDataUnsafe.user); } }, [isAuthenticated, syncUserWithBackend]); return null; };
const UserGatekeeper = ({ children }) => { const { isAuthenticated, isLoadingAuth } = useUserStore(); if (isLoadingAuth) { return ( <div className="w-full h-screen flex items-center justify-center bg-dark-primary"><Loader text="Autenticando..." /></div> ); } if (!isAuthenticated) { return ( <div className="w-full h-screen flex items-center justify-center p-4 bg-dark-primary">Error de autenticación. Por favor, reinicia la app desde Telegram.</div> ); } return children; };

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