// src/components/layout/Layout.jsx (VERSIÓN CON ANIMACIÓN DE SALIDA ÚNICAMENTE)
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNavBar from './BottomNavBar';

const Layout = () => {
  const location = useLocation();

  const backgroundClass = location.pathname === '/' 
    ? 'bg-space-background bg-cover bg-center' 
    : 'bg-internal-background bg-cover bg-center';

  return (
    <div className={`w-full min-h-screen text-text-primary font-sans ${backgroundClass}`}>
      <div className="container mx-auto max-w-lg min-h-screen flex flex-col bg-transparent">
        <main className="flex-grow p-4 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              // --- CAMBIO CLAVE AQUÍ ---
              // Hemos eliminado las propiedades 'initial' y 'animate'.
              // La página ahora aparecerá instantáneamente.
              
              // Solo conservamos la animación de 'exit' para una salida suave.
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col flex-grow"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="sticky bottom-0 z-50">
          <BottomNavBar />
        </footer>
      </div>
    </div>
  );
};

export default Layout;