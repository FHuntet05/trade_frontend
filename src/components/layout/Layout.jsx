// frontend/src/components/layout/Layout.jsx (VERSIÓN OPTIMIZADA CON ANIMACIÓN CSS)

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';
import './LayoutAnimations.css'; // Importaremos un nuevo archivo CSS

const Layout = () => {
  const location = useLocation();

  const backgroundClass = location.pathname === '/' 
    ? 'bg-space-background bg-cover bg-center' 
    : 'bg-internal-background bg-cover bg-center';

  return (
    <div className={`w-full min-h-screen text-text-primary font-sans ${backgroundClass}`}>
      <div className="container mx-auto max-w-lg min-h-screen flex flex-col bg-transparent">
        <main className="flex-grow p-4 flex flex-col overflow-y-auto">
          {/* 
            - Eliminamos AnimatePresence y motion.div.
            - Usamos un div simple. La 'key' le dice a React que este es un nuevo componente
              en cada cambio de ruta, lo que nos permite volver a aplicar la animación.
            - 'fade-in' es nuestra nueva clase de animación CSS.
          */}
          <div key={location.pathname} className="flex flex-col flex-grow fade-in">
            <Outlet />
          </div>
        </main>
        <footer className="sticky bottom-0 z-50">
          <BottomNavBar />
        </footer>
      </div>
    </div>
  );
};

export default Layout;