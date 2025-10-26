// RUTA: frontend/src/App.jsx
// --- VERSIÓN FINAL Y COMPLETA CON INTEGRACIÓN DE ERROR BOUNDARY ---

import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';
import AppRoutes from './routes';
import AuthLoadingPage from './pages/AuthLoadingPage';
import ErrorBoundary from './components/ErrorBoundary'; // --- Se importa el nuevo componente ---

const AppInitializer = () => { 
  const { isAuthenticated, syncUserWithBackend } = useUserStore(); 
  
  useEffect(() => { 
    if (isAuthenticated) return; 
    
    const tg = window.Telegram?.WebApp; 
    if (tg?.initDataUnsafe?.user?.id) { 
      syncUserWithBackend(tg.initDataUnsafe.user); 
    }
  }, [isAuthenticated, syncUserWithBackend]); 
  
  return null; 
};

const UserGatekeeper = ({ children }) => { 
  const { isAuthenticated, isLoadingAuth, user, error } = useUserStore(); 
  
  if (isLoadingAuth || (isAuthenticated && !user)) { 
    return <AuthLoadingPage />;
  } 
  
  if (!isAuthenticated) { 
    return ( 
      <div className="w-full h-screen flex flex-col items-center justify-center text-center p-4 bg-system-background text-text-primary">
        <h2 className="text-xl font-bold text-red-500">Error de Autenticación</h2>
        <p className="text-text-secondary mt-2">
          {error || 'No se pudo verificar tu sesión. Por favor, reinicia la aplicación desde Telegram.'}
        </p>
      </div> 
    ); 
  } 
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      
      <AppInitializer />
      
      <UserGatekeeper>
        {/* --- CORRECCIÓN CRÍTICA APLICADA --- */}
        {/* Se envuelve AppRoutes con ErrorBoundary para capturar cualquier error de renderizado */}
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </UserGatekeeper>
    </Router>
  );
}

export default App;