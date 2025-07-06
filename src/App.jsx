// frontend/src/App.jsx (VERSIÓN FINAL CON AUTENTICACIÓN COMPLETA)

import React, { useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';

import AuthGuard from './components/AuthGuard';
import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
import AuthErrorScreen from './components/AuthErrorScreen'; // Asegúrate de crear este componente

// Importación de páginas...
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage';
import RankingPage from './pages/RankingPage';
import TeamPage from './pages/TeamPage';
import ProfilePage from './pages/ProfilePage';
import LanguagePage from './pages/LanguagePage';
import RechargePage from './pages/RechargePage';
import NotFoundPage from './pages/NotFoundPage';
import FaqPage from './pages/FaqPage';
import AboutPage from './pages/AboutPage';
import SupportPage from './pages/SupportPage';
import FinancialHistoryPage from './pages/FinancialHistoryPage';


function App() {
  const user = useUserStore((state) => state.user);
  const authError = useUserStore((state) => state.error);

  useLayoutEffect(() => {
    const initializeAuth = async () => {
      const { checkAuthStatus, login, logout } = useUserStore.getState();
      
      const status = await checkAuthStatus();

      if (status === 'no-token' || status === 'invalid-token') {
        try {
          const tg = window.Telegram?.WebApp;

          if (tg && tg.initData) {
            await login(tg.initData);
          } else {
            console.warn("No se está ejecutando en Telegram o initData no está disponible.");
            logout(); 
          }
        } catch (e) {
          console.error("Error catastrófico durante el login inicial:", e);
          logout();
        }
      }
    };

    initializeAuth();
  }, []);
  
  // Estado 1: La verificación inicial está en curso (user es 'undefined').
  if (user === undefined) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-space-background">
        <Loader text="Inicializando..." />
      </div>
    );
  }

  // Estado 2: La autenticación ha fallado definitivamente (user es 'null').
  // Esto sucede si no estamos en Telegram o si el login con initData falló.
  if (user === null) {
    return <AuthErrorScreen message={authError || "Autenticación fallida. Por favor, reinicia la Mini App dentro de Telegram."} />;
  }
  
  // Estado 3: Autenticación exitosa (user es un objeto).
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <AuthGuard>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="tools" element={<ToolsPage />} />
            <Route path="ranking" element={<RankingPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          <Route path="/language" element={<LanguagePage />} />
          <Route path="/recharge" element={<RechargePage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/history" element={<FinancialHistoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthGuard>
    </Router>
  );
}

export default App;