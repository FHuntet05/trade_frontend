// frontend/src/App.jsx (VERSIÓN FINAL CON LÓGICA DE ARRANQUE A PRUEBA DE FALLOS)

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';

import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
import AuthErrorScreen from './components/AuthErrorScreen';

// Importación de páginas
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

  // Este useEffect se ejecuta una sola vez y maneja toda la lógica de arranque.
  useEffect(() => {
    const initializeApp = async () => {
      const { token, checkAuthStatus, login, finishInitialLoading } = useUserStore.getState();
      
      try {
        if (token) {
          // Si encontramos un token en el localStorage, intentamos validarlo.
          console.log("Token encontrado. Verificando estado...");
          await checkAuthStatus();
        } else {
          // Si no hay token, procedemos a un login nuevo.
          console.log("No hay token. Realizando login inicial...");
          const tg = window.Telegram?.WebApp;
          if (tg && tg.initData) {
            await login({
              initData: tg.initData,
              startParam: tg.initDataUnsafe?.start_param,
            });
          } else {
            // Si no hay token Y no hay datos de Telegram, no podemos hacer nada.
            console.error("No hay token ni datos de Telegram para autenticar.");
          }
        }
      } catch (e) {
        console.error("Error inesperado durante la inicialización:", e);
      } finally {
        // <<< LA SOLUCIÓN INFALIBLE >>>
        // Este bloque se ejecuta SIEMPRE, sin importar si el 'try' tuvo éxito o falló.
        // Garantiza que salgamos de la pantalla de carga.
        console.log("Finalizando estado de carga de autenticación.");
        finishInitialLoading();
      }
    };

    initializeApp();
  }, []); // El array vacío asegura que solo se ejecute al montar.
  
  // --- GUARDIA DE AUTENTICACIÓN ---
  if (isLoadingAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-dark-primary">
        <Loader text="Inicializando..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthErrorScreen message={"No se pudo autenticar. Por favor, reinicia la Mini App desde Telegram."} />;
  }
  
  // Si la carga terminó y estamos autenticados, mostramos la app.
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