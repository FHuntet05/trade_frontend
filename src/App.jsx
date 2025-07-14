// frontend/src/App.jsx (VERSIÓN FINAL Y ROBUSTA DE ARRANQUE)

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
  // <<< 1. Obtenemos los estados clave directamente del store.
  const { isAuthenticated, isLoadingAuth, error } = useUserStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isLoadingAuth: state.isLoadingAuth,
    error: state.error,
  }));

  // <<< 2. useEffect se ejecuta UNA SOLA VEZ para manejar la autenticación inicial.
  useEffect(() => {
    const initializeApp = async () => {
      // Obtenemos la función de login directamente del store.
      const { login } = useUserStore.getState();
      
      const tg = window.Telegram?.WebApp;

      if (tg && tg.initData) {
        // Si tenemos los datos de Telegram, simplemente intentamos hacer login.
        // La función 'login' en el store se encargará de poner isLoadingAuth en 'false' al terminar.
        await login({
          initData: tg.initData,
          startParam: tg.initDataUnsafe?.start_param,
        });
      } else {
        // Si no hay datos de Telegram, es un error fatal.
        // Forzamos el fin del estado de carga con un error.
        console.error("No se encontró Telegram.initData. La app no puede autenticar.");
        // Llamamos a logout para limpiar el estado y poner isLoadingAuth en false.
        useUserStore.getState().logout(); 
      }
    };

    initializeApp();
  }, []); // El array vacío asegura que esto se ejecute solo una vez.
  
  // <<< 3. EL GUARDIA DE AUTENTICACIÓN
  // Mientras isLoadingAuth sea true, el usuario solo verá esto.
  if (isLoadingAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-dark-primary">
        <Loader text="Autenticando..." />
      </div>
    );
  }

  // Si la carga terminó y el usuario NO está autenticado, mostramos un error.
  if (!isAuthenticated) {
    return <AuthErrorScreen message={error || "Autenticación fallida. Por favor, reinicia la Mini App."} />;
  }
  
  // Si la carga terminó y el usuario SÍ está autenticado, renderizamos la aplicación.
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