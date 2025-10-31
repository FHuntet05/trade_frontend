// RUTA: frontend/src/App.jsx

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';
import AppRoutes from './routes';
import AnimatedLoadingScreen from './components/AnimatedLoadingScreen'; 
import ErrorBoundary from './components/ErrorBoundary';

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
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);

  const isActuallyLoading = isLoadingAuth || (isAuthenticated && !user);

  useEffect(() => {
    // Si la carga real ha terminado...
    if (!isActuallyLoading) {
      // ...esperamos un breve momento para que la animación de "100%"
      // y el desvanecimiento del loader puedan completarse antes de desmontarlo.
      const timer = setTimeout(() => {
        setIsLoaderVisible(false);
      }, 1000); // 1 segundo (400ms para llegar a 100% + 500ms de fade-out + buffer)
      
      return () => clearTimeout(timer);
    }
  }, [isActuallyLoading]);


  if (isLoaderVisible) {
    // Pasamos `isDoneLoading` para que el componente sepa cuándo iniciar su animación de salida.
    return <AnimatedLoadingScreen isDoneLoading={!isActuallyLoading} />;
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
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </UserGatekeeper>
    </Router>
  );
}

export default App;