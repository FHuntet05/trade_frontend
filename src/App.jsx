// RUTA: frontend/src/App.jsx

import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';
import AppRoutes from './routes';
import AuthLoadingPage from './pages/AuthLoadingPage';

const AppInitializer = () => { 
  const { isAuthenticated, syncUserWithBackend } = useUserStore(); 
  
  useEffect(() => { 
    // Prevenir re-sincronización si ya estamos autenticados en esta sesión
    if (isAuthenticated) return; 
    
    const tg = window.Telegram?.WebApp; 
    if (tg?.initDataUnsafe?.user?.id) { 
      syncUserWithBackend(tg.initDataUnsafe.user); 
    } 
  }, [isAuthenticated, syncUserWithBackend]); 
  
  return null; 
};

const UserGatekeeper = ({ children }) => { 
  // --- INICIO DE LA CORRECCIÓN CRÍTICA ---
  // Obtenemos también el objeto 'user' para una verificación más robusta
  const { isAuthenticated, isLoadingAuth, user } = useUserStore(); 
  
  // Condición 1: Si estamos en el proceso de carga inicial, mostrar la pantalla de carga.
  if (isLoadingAuth) { 
    return <AuthLoadingPage />;
  } 
  
  // Condición 2 (NUEVA Y CRÍTICA): Si estamos autenticados PERO el objeto 'user'
  // aún no se ha poblado en el estado, seguir mostrando la pantalla de carga.
  // Esto previene la "pantalla en blanco" al cerrar la condición de carrera.
  if (isAuthenticated && !user) {
    return <AuthLoadingPage />;
  }
  
  // Condición 3: Si no estamos autenticados (y no estamos cargando), mostrar error.
  if (!isAuthenticated) { 
    return ( 
      <div className="w-full h-screen flex flex-col items-center justify-center text-center p-4 bg-system-background text-text-primary">
        <h2 className="text-xl font-bold text-red-500">Error de Autenticación</h2>
        <p className="text-text-secondary mt-2">No se pudo verificar tu sesión. Por favor, reinicia la aplicación desde Telegram.</p>
      </div> 
    ); 
  } 
  
  // Si todas las comprobaciones pasan, renderizar la aplicación.
  return children; 
  // --- FIN DE LA CORRECCIÓN CRÍTICA ---
};

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <AppInitializer />
      <UserGatekeeper>
        <AppRoutes />
      </UserGatekeeper>
    </Router>
  );
}

export default App;