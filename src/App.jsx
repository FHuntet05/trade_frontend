// RUTA: frontend/src/App.jsx


import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useUserStore from './store/userStore';
import AppRoutes from './routes';
import AuthLoadingPage from './pages/AuthLoadingPage';
// --- INICIO DE LA CORRECCIÓN CRÍTICA ---
// 1. Se importa el nuevo hook que gestiona la conexión WebSocket.
import { usePriceWebSocket } from './hooks/usePriceWebSocket';
// --- FIN DE LA CORRECCIÓN CRÍTICA ---

/**
 * Un componente "fantasma" que inicializa la conexión WebSocket
 * una vez que el usuario está autenticado.
 */
const WebSocketInitializer = () => {
  // --- INICIO DE LA CORRECCIÓN CRÍTICA ---
  // 2. Se llama al hook. Esto es todo lo que se necesita para activarlo.
  // La lógica de conexión, reconexión y actualización del store está encapsulada dentro del hook.
  usePriceWebSocket();
  // --- FIN DE LA CORRECCIÓN CRÍTICA ---
  return null; // Este componente no renderiza nada en la UI.
};

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
  
  // --- INICIO DE LA MEJORA ---
  // Se muestra el error de `userStore` si existe, que es más informativo
  // que el mensaje genérico de "Error de Autenticación".
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
  // --- FIN DE LA MEJORA ---
  
  // --- INICIO DE LA CORRECCIÓN CRÍTICA ---
  // 3. Se renderiza el inicializador del WebSocket junto con el resto de la app
  // solo si el usuario ha pasado la barrera de autenticación.
  return (
    <>
      <WebSocketInitializer />
      {children}
    </>
  );
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