// frontend/src/App.jsx (VERSIÓN ROBUSTA CON POLLING PARA AUTENTICACIÓN)

import React, { useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';

import AuthGuard from './components/AuthGuard';
import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
import AuthErrorScreen from './components/AuthErrorScreen';

// ... (todas tus importaciones de páginas)
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
        // --- INICIO DEL CAMBIO: LÓGICA DE POLLING ---
        let attempts = 0;
        const maxAttempts = 30; // Intentará durante 3 segundos (30 * 100ms)

        const pollForInitData = setInterval(async () => {
          const tg = window.Telegram?.WebApp;
          attempts++;

          // Condición de éxito: encontramos initData
          if (tg && tg.initData && tg.initData !== "") {
            clearInterval(pollForInitData);
            console.log(`initData encontrada en el intento #${attempts}. Intentando login...`);
            await login(tg.initData);
          } 
          // Condición de fracaso: se acabaron los intentos
          else if (attempts >= maxAttempts) {
            clearInterval(pollForInitData);
            console.error(`Timeout: initData no se encontró después de ${maxAttempts} intentos.`);
            logout();
          }
        }, 100); // Revisa cada 100ms
        // --- FIN DEL CAMBIO ---
      }
    };

    initializeAuth();
  }, []);
  
  // (El resto del componente no necesita cambios)
  
  if (user === undefined) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-space-background">
        <Loader text="Inicializando..." />
      </div>
    );
  }

  if (user === null) {
    return <AuthErrorScreen message={authError || "Autenticación fallida. Por favor, reinicia la Mini App dentro de Telegram."} />;
  }
  
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