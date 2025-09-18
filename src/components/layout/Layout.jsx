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
      {/* --- INICIO DE LA CORRECCIÓN DE MAQUETACIÓN --- */}
      {/* 
        1. 'h-screen' (altura completa de la pantalla) y 'flex flex-col' son la base
           para un layout con pie de página fijo.
      */}
      <div className="container mx-auto max-w-lg h-screen flex flex-col bg-transparent">
        {/*
          2. 'flex-1' (equivalente a flex-grow) hace que el 'main' ocupe todo el espacio vertical disponible.
          3. 'overflow-y-auto' AÑADE EL SCROLL ÚNICAMENTE A ESTA ÁREA de contenido.
          4. Se elimina el p-4 de aquí para que las páginas controlen su propio padding.
        */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            {/* 
              5. Se elimina la clase 'flex-grow' del motion.div para resolver el conflicto
                 que impedía que las páginas cambiaran. Ahora solo se encarga de la animación.
            */}
            <motion.div
              key={location.pathname}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full" // Asegura que la página animada ocupe el espacio
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* 
          6. 'flex-shrink-0' previene que el footer se encoja.
          7. Se ajusta el padding para elevar la barra de navegación:
             px-4 (padding horizontal), pb-6 (padding inferior aumentado), pt-2 (padding superior reducido).
        */}
        <footer className="flex-shrink-0 w-full px-4 pb-6 pt-2">
          <BottomNavBar />
        </footer>
        {/* --- FIN DE LA CORRECCIÓN DE MAQUETACIÓN --- */}
      </div>
    </div>
  );
};

export default Layout;