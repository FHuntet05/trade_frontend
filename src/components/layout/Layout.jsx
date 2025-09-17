// RUTA: src/components/layout/Layout.jsx (VERSIÓN NEXUS RECONSTRUIDA)
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNavBar from './BottomNavBar';

const Layout = () => {
  const location = useLocation();

  // --- LÓGICA DE FONDO CONTEXTUAL (Se mantiene) ---
  const backgroundClass = location.pathname === '/home' || location.pathname === '/'
    ? 'bg-space-background bg-cover bg-center' 
    : 'bg-internal-background bg-cover bg-center';

  return (
    // Se aplican las clases de Tailwind directamente para el fondo y la fuente
    <div className={`w-full min-h-screen text-text-primary font-sans ${backgroundClass} bg-fixed`}>
      <div className="container mx-auto max-w-lg min-h-screen flex flex-col bg-transparent">
        <main className="flex-grow p-4 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col flex-grow"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* --- INICIO DE LA CORRECCIÓN DE ESTILO --- */}
        {/*
          1. Se cambia 'sticky' por 'relative' y se añade padding. Esto crea el efecto "flotante".
          2. Se elimina el z-index, ya no es necesario en este contexto.
        */}
        <footer className="relative w-full p-4">
          <BottomNavBar />
        </footer>
        {/* --- FIN DE LA CORRECCIÓN DE ESTILO --- */}
      </div>
    </div>
  );
};

export default Layout;