// RUTA: src/components/layout/Layout.jsx (VERSIÓN NEXUS CON MAQUETACIÓN FIJA)
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
      <div className="container mx-auto max-w-lg h-screen flex flex-col bg-transparent">
        {/* --- INICIO DE LA CORRECCIÓN DE SCROLL --- */}
        {/*
          1. 'flex-grow' hace que el main ocupe todo el espacio vertical disponible.
          2. 'overflow-y-auto' AÑADE EL SCROLL ÚNICAMENTE A ESTA ÁREA.
        */}
        <main className="flex-grow overflow-y-auto no-scrollbar p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col flex-grow" // Se mantiene para animaciones
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* 
          3. 'flex-shrink-0' previene que el footer se encoja.
          4. El padding se aplica aquí para dar el efecto flotante a la barra.
        */}
        <footer className="flex-shrink-0 w-full p-4">
          <BottomNavBar />
        </footer>
        {/* --- FIN DE LA CORRECCIÓN DE SCROLL --- */}
      </div>
    </div>
  );
};

export default Layout;