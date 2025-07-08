// frontend/src/App.jsx (VERSIÓN COMPLETA Y CORREGIDA PARA REFERIDOS)

import React, { useState, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';

import AuthGuard from './components/AuthGuard';
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
  const user = useUserStore((state) => state.user);
  const authError = useUserStore((state) => state.error);
  const [isInitializing, setIsInitializing] = useState(true);

  useLayoutEffect(() => {
    const initializeAuth = async () => {
      const { checkAuthStatus, login, logout } = useUserStore.getState();
      
      const status = await checkAuthStatus();

      if (status === 'no-token' || status === 'invalid-token') {
        try {
          const tgData = await new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 30;
            
            const interval = setInterval(() => {
              const tg = window.Telegram?.WebApp;
              attempts++;
              
              if (tg && tg.initData) {
                clearInterval(interval);
                // CORRECCIÓN: Resolvemos con un objeto que contiene ambos datos
                resolve({
                  initData: tg.initData,
                  startParam: tg.initDataUnsafe?.start_param,
                });
              } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                reject(new Error("Timeout: initData no se encontró."));
              }
            }, 100);
          });
          // <<< INICIO DE LA LÓGICA CRÍTICA CORREGIDA >>>

        // La presencia de start_param indica un nuevo flujo (potencialmente un referido).
        // En este caso, SIEMPRE debemos forzar un nuevo login, ignorando cualquier token antiguo.
        if (tgData.startParam) {
          console.log("Parámetro de inicio detectado. Forzando nuevo login de referido...");
          await login(tgData);
        } else {
          // Si NO hay start_param, procedemos con el flujo normal:
          // 1. Verificamos si hay un token existente y válido.
          const status = await checkAuthStatus();

          // 2. Si no hay token o es inválido, intentamos un login normal.
          if (status === 'no-token' || status === 'invalid-token') {
            console.log("Sin token válido. Intentando login estándar...");
            await login(tgData);
          }
          // 3. Si el token era válido ('authenticated'), no hacemos nada, el usuario ya está cargado.
          else {
            console.log("Sesión existente válida encontrada.");
          }
        }
        // <<< FIN DE LA LÓGICA CRÍTICA CORREGIDA >>>
         } catch (e) {
        console.error("Error fatal en la inicialización:", e.message);
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
    };
    initializeAuth();
  }, []);
  
  if (isInitializing) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-space-background">
        <Loader text="Inicializando..." />
      </div>
    );
  }

  if (user === null) {
    return <AuthErrorScreen message={authError || "Autenticación fallida. Por favor, reinicia la Mini App."} />;
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