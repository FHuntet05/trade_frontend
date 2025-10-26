// RUTA: frontend/src/App.jsx
// --- VERSIÓN FINAL Y COMPLETA, DEPURADA DE CÓDIGO OBSOLETO ---

import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';
import AppRoutes from './routes';
import AuthLoadingPage from './pages/AuthLoadingPage';
// La importación de 'usePriceWebSocket' ha sido eliminada.

// El componente 'WebSocketInitializer' ha sido eliminado por completo.
// Su lógica de polling ha sido reemplazada por la estrategia de caché
// centralizada en `marketStore.js`.

const AppInitializer = () => { 
  const { isAuthenticated, syncUserWithBackend } = useUserStore(); 
  
  useEffect(() => { 
    if (isAuthenticated) return; 
    
    // Sincroniza al usuario basándose en los datos de la Web App de Telegram.
    const tg = window.Telegram?.WebApp; 
    if (tg?.initDataUnsafe?.user?.id) { 
      syncUserWithBackend(tg.initDataUnsafe.user); 
    }
  }, [isAuthenticated, syncUserWithBackend]); 
  
  // Este componente no renderiza nada visible.
  return null; 
};

const UserGatekeeper = ({ children }) => { 
  const { isAuthenticated, isLoadingAuth, user, error } = useUserStore(); 
  
  // Muestra una pantalla de carga mientras se verifica la autenticación.
  if (isLoadingAuth || (isAuthenticated && !user)) { 
    return <AuthLoadingPage />;
  } 
  
  // Si la autenticación falla, muestra una pantalla de error clara.
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
  
  // Si el usuario está autenticado, renderiza la aplicación principal.
  // No hay necesidad de componentes inicializadores adicionales.
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      {/* Componente para mostrar notificaciones toast */}
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Componente para manejar la sincronización inicial del usuario */}
      <AppInitializer />
      
      {/* Guardián que protege las rutas y asegura que el usuario esté autenticado */}
      <UserGatekeeper>
        <AppRoutes />
      </UserGatekeeper>
    </Router>
  );
}

export default App;