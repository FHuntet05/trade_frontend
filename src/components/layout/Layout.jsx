// RUTA: src/components/layout/Layout.jsx (VERSIÓN "NEXUS - SUPPORT BUTTON INTEGRATED")
import React, { useRef } from 'react'; // [NEXUS SUPPORT FIX] Importamos useRef
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';
import useUserStore from '../../store/userStore';
import BannedUserPage from '../../pages/BannedUserPage';
import FloatingSupportButton from '../common/FloatingSupportButton'; // [NEXUS SUPPORT FIX] Importamos el botón

const Layout = () => {
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  
  // [NEXUS SUPPORT FIX] Creamos una referencia al contenedor principal.
  // Esto definirá los límites dentro de los cuales se puede arrastrar el botón.
  const layoutRef = useRef(null);

  const backgroundClass = location.pathname === '/home' || location.pathname === '/'
    ? 'bg-space-background' 
    : 'bg-internal-background';

  if (user && user.status === 'banned') {
    return <BannedUserPage />;
  }

  return (
    // [NEXUS SUPPORT FIX] Añadimos la 'ref' al div principal.
    <div ref={layoutRef} className={`relative w-full min-h-screen text-text-primary font-sans ${backgroundClass} bg-cover bg-center bg-fixed overflow-hidden`}>
      <div className="container mx-auto max-w-lg h-screen flex flex-col bg-transparent">
        
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <Outlet />
        </main>
        
        <footer className="flex-shrink-0 w-full px-4 pb-6 pt-2">
          <BottomNavBar />
        </footer>

        {/* [NEXUS SUPPORT FIX] Renderizamos el botón flotante aquí. */}
        {/* Le pasamos la referencia del layout para contener su movimiento. */}
        <FloatingSupportButton dragRef={layoutRef} />
        
      </div>
    </div>
  );
};

export default Layout;