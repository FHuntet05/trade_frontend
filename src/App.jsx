// frontend/src/App.jsx (VERSIÓN CORREGIDA Y SIMPLIFICADA)

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
      
      try {
        // --- PASO 1: ESPERAR A QUE TELEGRAM ESTÉ LISTO ---
        // Este es el único punto de espera. Obtenemos los datos de Telegram o fallamos si no están disponibles.
        const tgData = await new Promise((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 30; // 30 intentos * 100ms = 3 segundos de timeout
          
          const interval = setInterval(() => {
            const tg = window.Telegram?.WebApp;
            attempts++;
            
            if (tg && tg.initData) {
              clearInterval(interval);
              resolve({
                initData: tg.initData,
                startParam: tg.initDataUnsafe?.start_param,
              });
            } else if (attempts >= maxAttempts) {
              clearInterval(interval);
              reject(new Error("Timeout: Telegram initData no encontrado."));
            }
          }, 100);
        });

        // --- PASO 2: DECIDIR LA ESTRATEGIA DE AUTENTICACIÓN ---
        
        // Estrategia 1: Es un referido (o un enlace con start_param).
        // La presencia de start_param tiene máxima prioridad. Siempre forzamos un nuevo login para
        // asegurar que el referido se registre correctamente, ignorando cualquier sesión local.
        if (tgData.startParam) {
          console.log(`Parámetro de inicio '${tgData.startParam}' detectado. Forzando login de referido.`);
          await login(tgData);
        } else {
          // Estrategia 2: No es un referido. Flujo de usuario normal.
          // Primero, verificamos si ya existe una sesión local válida.
          const status = await checkAuthStatus();

          if (status === 'authenticated') {
            // El usuario ya tiene una sesión válida. No hacemos nada.
            // El store ya cargó al usuario desde el token.
            console.log("Sesión local válida encontrada. Saltando login.");
          } else {
            // No hay sesión válida ('no-token', 'invalid-token').
            // Procedemos con un login estándar. Esto cubre tanto a usuarios nuevos
            // sin referido como a usuarios existentes que abren la app de nuevo.
            console.log("Sin sesión válida. Realizando login estándar.");
            await login(tgData);
          }
        }

      } catch (e) {
        console.error("Error fatal en la inicialización de la app:", e.message);
        // Si algo falla, limpiamos el estado para evitar bucles.
        logout();
      } finally {
        // Este bloque SIEMPRE se ejecutará, ya sea que la autenticación tuvo éxito o falló,
        // garantizando que salgamos de la pantalla de carga.
        setIsInitializing(false);
      }
    };

    // --- CORRECCIÓN CRÍTICA: Se llama a la función UNA SOLA VEZ ---
    initializeAuth();

  }, []); // El array vacío asegura que este efecto se ejecute solo una vez.
  
  if (isInitializing) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-space-background">
        <Loader text="Inicializando..." />
      </div>
    );
  }

  // Si después de inicializar no hay usuario, mostramos un error claro.
  if (user === null) {
    return <AuthErrorScreen message={authError || "No se pudo autenticar. Por favor, reinicia la Mini App."} />;
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