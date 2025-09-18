// RUTA: src/components/layout/Layout.jsx (VERSIÓN NEXUS RECONSTRUIDA Y CORREGIDA)
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNavBar from './BottomNavBar';

const Layout = () => {
  const location = useLocation();

  const backgroundClass = location.pathname === '/home' || location.pathname === '/'
    ? 'bg-space-background bg-cover bg-center' 
    : 'bg-internal-background bg-cover bg-center';

  return (
    // Se añade bg-fixed para que la imagen de fondo no se desplace con el contenido
    <div className={`w-full min-h-screen text-text-primary font-sans ${backgroundClass} bg-fixed`}>
      {/* 
        Estructura Flexbox vertical que ocupa toda la pantalla para un pie de página fijo.
      */}
      <div className="container mx-auto max-w-lg h-screen flex flex-col bg-transparent">
        {/*
          El 'main' ocupa todo el espacio vertical disponible y tiene su propio scroll.
        */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            {/* 
              Se elimina el 'flex-grow' conflictivo. Ahora solo se encarga de la animación.
            */}
            <motion.div
              key={location.pathname}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full" 
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* 
          El footer no se encoge y tiene un padding inferior aumentado para elevar la barra.
        */}
        <footer className="flex-shrink-0 w-full px-4 pb-6 pt-2">
          <BottomNavBar />
        </footer>
      </div>
    </div>
  );
};

export default Layout;