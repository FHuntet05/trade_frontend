// frontend/src/App.jsx (VERSIÓN ESTABILIZADA SIN PARPADEO)

import React, { useState, useLayoutEffect } from 'react'; // Importa useState
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
  // Obtenemos el usuario y el error de nuestro store
  const user = useUserStore((state) => state.user);
  const authError = useUserStore((state) => state.error);

  // 1. Creamos un estado de carga local. Este será nuestra única fuente de verdad para mostrar el Loader inicial.
  const [isInitializing, setIsInitializing] = useState(true);

  useLayoutEffect(() => {
    const initializeAuth = async () => {
      const { checkAuthStatus, login, logout } = useUserStore.getState();
      
      const status = await checkAuthStatus();

      if (status === 'no-token' || status === 'invalid-token') {
        try {
          // Lógica de polling para esperar a Telegram, ahora dentro de una Promesa para un código más limpio.
          const initData = await new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 30; // Intentará durante 3 segundos (30 * 100ms)
            
            const interval = setInterval(() => {
              const tg = window.Telegram?.WebApp;
              attempts++;
              
              if (tg && tg.initData && tg.initData !== "") {
                clearInterval(interval);
                resolve(tg.initData);
              } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                reject(new Error("Timeout: initData no se encontró después de 3 segundos."));
              }
            }, 100); // Revisa cada 100ms
          });
          
          console.log("initData encontrada. Intentando login...");
          await login(initData);

        } catch (e) {
          console.error(e.message);
          logout();
        }
      }
      
      // 2. Al finalizar TODO el proceso de autenticación, sea cual sea el resultado (éxito, fracaso o token válido),
      //    desactivamos el estado de inicialización para proceder al renderizado final.
      setIsInitializing(false);
    };

    initializeAuth();
  }, []);
  
  // 3. Nuestra nueva lógica de renderizado: más simple y robusta.
  //    Primero, verificamos si la app está en su fase de carga inicial.
  if (isInitializing) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-space-background">
        <Loader text="Inicializando..." />
      </div>
    );
  }

  //    Solo si YA NO ESTÁ inicializando, verificamos si el usuario es nulo (lo que significa un error de autenticación definitivo).
  if (user === null) {
    return <AuthErrorScreen message={authError || "Autenticación fallida. Por favor, reinicia la Mini App dentro de Telegram."} />;
  }
  
  //    Si no está inicializando y el usuario no es nulo, mostramos la aplicación completa.
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