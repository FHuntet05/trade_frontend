// frontend/src/App.jsx (VERSIÓN FINAL CON ARRANQUE DIRECTO Y COMPLETO)

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';

import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
import AuthErrorScreen from './components/AuthErrorScreen';

// Importación COMPLETA de páginas
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
  const { isAuthenticated, isLoadingAuth } = useUserStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isLoadingAuth: state.isLoadingAuth,
  }));

  // El useEffect ahora tiene una única y simple responsabilidad: iniciar el login.
  useEffect(() => {
    // Usamos un pequeño timeout para asegurarnos de que el objeto de Telegram esté disponible.
    const timeoutId = setTimeout(() => {
        const tg = window.Telegram?.WebApp;
        const { login, logout } = useUserStore.getState();

        if (tg && tg.initData) {
            login({
              initData: tg.initData,
              startParam: tg.initDataUnsafe?.start_param,
            });
        } else {
            console.error("Timeout: Telegram.WebApp.initData no se encontró después de 500ms.");
            logout(); // Si no hay datos, limpiamos y salimos del loading.
        }
    }, 500); // 500ms de espera

    return () => clearTimeout(timeoutId); // Limpieza del timeout
  }, []); 

  // --- GUARDIA DE AUTENTICACIÓN ---
  if (isLoadingAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-dark-primary">
        <Loader text="Conectando..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthErrorScreen message={"No se pudo conectar con el servidor. Por favor, reinicia la Mini App desde Telegram."} />;
  }
  
  // Si todo está bien, renderizamos la aplicación COMPLETA.
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
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
    </Router>
  );
}

export default App;