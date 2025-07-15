// frontend/src/App.jsx (VERSIÓN FINAL CON RUTAS DE ADMIN INTEGRADAS)

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Stores
import useUserStore from './store/userStore';

// Layouts y Componentes Comunes
import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
import AuthErrorScreen from './components/AuthErrorScreen';
import AdminProtectedRoute from './components/layout/AdminProtectedRoute';

// Páginas de la App de Usuario
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

// Páginas del Panel de Administración
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';


/**
 * Componente que encapsula TODA la lógica y rutas de la Mini App de Telegram.
 * Solo se renderiza si la URL no empieza con /admin.
 */
function UserAppShell() {
  const { isAuthenticated, isLoadingAuth } = useUserStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isLoadingAuth: state.isLoadingAuth,
  }));

  // Los guardias de autenticación ahora solo afectan a esta parte de la aplicación.
  if (isLoadingAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-dark-primary">
        <Loader text="Conectando..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthErrorScreen message={"No se pudo conectar. Por favor, reinicia la Mini App desde Telegram."} />;
  }

  // Si el usuario está autenticado, renderizamos todas las rutas de la Mini App.
  return (
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

      {/* Un catch-all para las rutas no encontradas DENTRO de la app de usuario */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

/**
 * El componente principal de la aplicación. Actúa como un enrutador maestro.
 */
function App() {
  const initializeAuth = useUserStore((state) => state.login);

  // Este useEffect se ejecuta al cargar la app.
  // Intentará autenticar al usuario si existen datos de Telegram.
  // No bloqueará el renderizado para las rutas de admin.
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.initData) {
      initializeAuth({
        initData: tg.initData,
        startParam: tg.initDataUnsafe?.start_param,
      });
    } else {
      // Si no hay datos de Telegram, simplemente no hacemos nada aquí.
      // El guardia dentro de UserAppShell se encargará de mostrar el error si es necesario.
      useUserStore.getState().logout();
    }
  }, [initializeAuth]);

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* --- RUTAS DEL PANEL DE ADMINISTRACIÓN --- */}
        {/* La página de login es pública. */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        {/* Las rutas dentro de AdminProtectedRoute requieren autenticación de admin. */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          {/* Aquí irán futuras rutas de admin: /admin/users, /admin/transactions, etc. */}
        </Route>

        {/* --- RUTAS DE LA MINI APP DE TELEGRAM --- */}
        {/* Un "catch-all" que dirige todo el tráfico restante a la shell de la app de usuario. */}
        <Route path="/*" element={<UserAppShell />} />
      </Routes>
    </Router>
  );
}

export default App;
