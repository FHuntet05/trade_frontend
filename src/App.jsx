// RUTA: frontend/src/App.jsx

import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';
import AppRoutes from './routes';
import AuthLoadingPage from './pages/AuthLoadingPage';

// --- INICIO: NUEVO COMPONENTE DE DEPURACIÓN ---
const DebugObserver = () => {
  const { isLoadingAuth, isAuthenticated, user, error } = useUserStore();

  const stateForDisplay = {
    isLoadingAuth,
    isAuthenticated,
    user: user ? { id: user._id, username: user.username, status: user.status } : null,
    error,
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      zIndex: 99999,
      fontSize: '12px',
      fontFamily: 'monospace',
      borderRadius: '8px',
      maxWidth: 'calc(100% - 20px)'
    }}>
      <pre>{JSON.stringify(stateForDisplay, null, 2)}</pre>
    </div>
  );
};
// --- FIN: NUEVO COMPONENTE DE DEPURACIÓN ---

const AppInitializer = () => { 
  const { isAuthenticated, syncUserWithBackend } = useUserStore(); 
  useEffect(() => { 
    if (isAuthenticated) return; 
    const tg = window.Telegram?.WebApp; 
    if (tg?.initDataUnsafe?.user?.id) { 
      syncUserWithBackend(tg.initDataUnsafe.user); 
    } else {
      console.error("[Depuración] No se encontró el objeto de usuario de Telegram para iniciar la sincronización.");
    }
  }, [isAuthenticated, syncUserWithBackend]); 
  return null; 
};

// Se mantiene el Gatekeeper de la corrección anterior, ya que es robusto
const UserGatekeeper = ({ children }) => { 
  const { isAuthenticated, isLoadingAuth, user } = useUserStore(); 
  
  if (isLoadingAuth || (isAuthenticated && !user)) { 
    return <AuthLoadingPage />;
  } 
  
  if (!isAuthenticated) { 
    // Añadimos el observador también en la pantalla de error
    return ( 
      <>
        <DebugObserver />
        <div className="w-full h-screen flex flex-col items-center justify-center text-center p-4 bg-system-background text-text-primary">
          <h2 className="text-xl font-bold text-red-500">Error de Autenticación</h2>
          <p className="text-text-secondary mt-2">No se pudo verificar tu sesión. Por favor, reinicia la aplicación desde Telegram.</p>
        </div>
      </>
    ); 
  } 
  
  return children; 
};

function App() {
  return (
    <Router>
      <DebugObserver /> {/* <-- Lo añadimos aquí para que siempre esté visible */}
      <Toaster position="top-center" reverseOrder={false} />
      <AppInitializer />
      <UserGatekeeper>
        <AppRoutes />
      </UserGatekeeper>
    </Router>
  );
}

export default App;