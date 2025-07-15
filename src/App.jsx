// frontend/src/App.jsx (VERSIÓN REFACTORIZADA Y ESTABLE)

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
  const { isAuthenticated, isLoadingAuth, initializeAuth } = useUserStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isLoadingAuth: state.isLoadingAuth,
    // Optamos por llamar a una función del store en lugar de getState() para mayor claridad en React
    initializeAuth: state.login, 
  }));

  // useEffect es ahora simple, directo y se ejecuta una sola vez.
  useEffect(() => {
    // La responsabilidad de encontrar los datos de Telegram y actuar en consecuencia
    // se delega directamente a la lógica de inicialización.
    // No más timeouts frágiles.
    const tg = window.Telegram?.WebApp;
    
    if (tg && tg.initData) {
      initializeAuth({
        initData: tg.initData,
        startParam: tg.initDataUnsafe?.start_param,
      });
    } else {
      // Si no hay datos de Telegram, es un fallo fatal de autenticación.
      // Usamos un pequeño delay para evitar un flash de UI y asegurar que el mensaje sea legible.
      console.error("Telegram.WebApp.initData no se encontró en el montaje inicial.");
      useUserStore.getState().logout(); // Llamamos a logout para resolver el estado de carga.
    }
  }, [initializeAuth]); // Se añade 'initializeAuth' como dependencia, aunque no cambiará.

  // --- GUARDIA DE AUTENTICACIÓN (sin cambios, ahora funcionará correctamente) ---
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