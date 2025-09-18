// RUTA: src/components/layout/Layout.jsx (VERSIÓN NEXUS - SOLUCIÓN DEFINITIVA DE NAVEGACIÓN Y SCROLL)
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNavBar from './BottomNavBar';

const Layout = () => {
  const location = useLocation();

  const backgroundClass = location.pathname === '/home' || location.pathname === '/'
    ? 'bg-space-background' 
    : 'bg-internal-background';

  return (
    // Contenedor global: cubre toda la pantalla y fija la imagen de fondo.
    <div className={`w-full min-h-screen text-text-primary font-sans ${backgroundClass} bg-cover bg-center bg-fixed`}>
      
      {/* Contenedor principal de la aplicación: Centrado y con altura de pantalla completa. */}
      {/* [CORRECCIÓN FUNDAMENTAL 1]: 'h-screen' y 'flex flex-col' son la base.
          Esto crea un contenedor flexible que ocupa toda la altura de la ventana,
          permitiendo que podamos fijar la barra de navegación en la parte inferior. */}
      <div className="container mx-auto max-w-lg h-screen flex flex-col bg-transparent">
        
        {/* ÁREA DE CONTENIDO PRINCIPAL */}
        {/* [CORRECCIÓN FUNDAMENTAL 2]: 'flex-1' (crecer) y 'overflow-y-auto' (scroll).
            Este 'main' se expandirá para ocupar todo el espacio vertical sobrante.
            Si el contenido dentro de él es más alto que el espacio disponible,
            APARECERÁ UNA BARRA DE SCROLL ÚNICAMENTE EN ESTA SECCIÓN. */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            {/* [CORRECCIÓN FUNDAMENTAL 3]: ELIMINACIÓN DEL CONFLICTO DE RENDERIZADO.
                El problema que impedía el cambio de páginas era una clase de flexbox
                (como flex-1 o flex-grow) aplicada directamente a este 'motion.div'.
                Al quitarla, Framer Motion solo se encarga de la animación, y el 'Outlet'
                puede ser reemplazado correctamente por React Router sin conflictos. */}
            <motion.div
              key={location.pathname} // La clave que dispara la animación al cambiar de ruta
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full" // Asegura que la página ocupe todo el alto del 'main'
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* PIE DE PÁGINA CON LA BARRA DE NAVEGACIÓN */}
        {/* 'flex-shrink-0' previene que el footer se encoja. */}
        <footer className="flex-shrink-0 w-full px-4 pb-6 pt-2">
          <BottomNavBar />
        </footer>

      </div>
    </div>
  );
};

export default Layout;