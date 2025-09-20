// RUTA: src/components/layout/Layout.jsx (VERSIÓN NEXUS - ENFORCEMENT ADDED)
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';
import useUserStore from '../../store/userStore'; // [NEXUS ENFORCEMENT] Importamos el store
import BannedUserPage from '../../pages/BannedUserPage'; // [NEXUS ENFORCEMENT] Importamos la nueva página

const Layout = () => {
  const location = useLocation();
  
  // [NEXUS ENFORCEMENT] Obtenemos el usuario completo del store de Zustand.
  const user = useUserStore((state) => state.user);

  const backgroundClass = location.pathname === '/home' || location.pathname === '/'
    ? 'bg-space-background' 
    : 'bg-internal-background';

  // [NEXUS ENFORCEMENT] Si el usuario está baneado, no renderizamos el layout normal.
  // En su lugar, mostramos la página de baneo a pantalla completa.
  if (user && user.status === 'banned') {
    return <BannedUserPage />;
  }

  // Si el usuario no está baneado, o si aún no ha cargado, se muestra el layout normal.
  return (
    <div className={`w-full min-h-screen text-text-primary font-sans ${backgroundClass} bg-cover bg-center bg-fixed`}>
      <div className="container mx-auto max-w-lg h-screen flex flex-col bg-transparent">
        
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {/* El Outlet ahora está protegido por la lógica de baneo anterior. */}
          <Outlet />
        </main>
        
        <footer className="flex-shrink-0 w-full px-4 pb-6 pt-2">
          <BottomNavBar />
        </footer>

      </div>
    </div>
  );
};

export default Layout;