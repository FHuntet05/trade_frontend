// frontend/src/App.jsx (VERSIÓN FINAL CON GUARDIA DE AUTENTICACIÓN ROBUSTO)

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

// Este componente hijo se encargará de la lógica de inicialización.
const AuthInitializer = () => {
  // useEffect se ejecuta una sola vez al montar el componente.
  useEffect(() => {
    const initialize = async () => {
      const { checkAuthStatus, login } = useUserStore.getState();

      // Intenta validar el token del localStorage primero.
      const status = await checkAuthStatus();
      
      // Si no hay token o es inválido, procede con el login usando initData.
      if (status === 'no-token' || status === 'invalid-token') {
        try {
          const tg = window.Telegram?.WebApp;
          if (tg && tg.initData) {
            console.log("Realizando login inicial con datos de Telegram...");
            await login({
              initData: tg.initData,
              startParam: tg.initDataUnsafe?.start_param,
            });
          } else {
            // Si no hay initData, es un error fatal de la app de Telegram.
            throw new Error("Telegram initData no está disponible.");
          }
        } catch (e) {
          console.error("Error fatal durante el login inicial:", e);
          useUserStore.getState().logout();
        }
      } else {
        console.log("Sesión restaurada desde el token local.");
      }
    };
    
    initialize();
  }, []);

  return null; // Este componente no renderiza nada, solo ejecuta la lógica.
};

function App() {
  // Obtenemos los estados clave directamente del store.
  const { isAuthenticated, isLoadingAuth, error } = useUserStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isLoadingAuth: state.isLoadingAuth,
    error: state.error,
  }));

  // --- El Guardia de Autenticación ---
  // 1. Mientras `isLoadingAuth` sea true, mostramos una pantalla de carga global.
  // Esto bloquea cualquier interacción hasta que sepamos si el usuario está o no autenticado.
  if (isLoadingAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-dark-primary">
        <Loader text="Autenticando..." />
      </div>
    );
  }

  // 2. Si la carga terminó y el usuario NO está autenticado, mostramos un error.
  if (!isAuthenticated) {
    return <AuthErrorScreen message={error || "Autenticación fallida. Por favor, reinicia la Mini App."} />;
  }
  
  // 3. Si la carga terminó y el usuario SÍ está autenticado, renderizamos la app.
  return (
    <Router>
      <AuthInitializer /> {/* El componente que maneja la lógica de inicio */}
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