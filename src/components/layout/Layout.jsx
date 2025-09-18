// RUTA: src/components/layout/Layout.jsx (VERSIÓN NEXUS - CONTROL ÚNICO Y ROBUSTO)
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
    <div className={`w-full min-h-screen text-text-primary font-sans ${backgroundClass} bg-cover bg-center bg-fixed`}>
      <div className="container mx-auto max-w-lg h-screen flex flex-col bg-transparent">
        
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              // ======================= CORRECCIÓN SUTIL PERO VITAL =======================
              // Se elimina la clase 'h-full'. Forzar la altura del contenedor de la animación
              // era parte del conflicto. Ahora, el contenedor tendrá la altura de su contenido
              // (la página que está dentro), lo que es más natural y robusto.
              // El scroll lo manejará el padre ('main') si es necesario.
              // ======================== FIN DE LA CORRECCIÓN =========================
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        
        <footer className="flex-shrink-0 w-full px-4 pb-6 pt-2">
          <BottomNavBar />
        </footer>

      </div>
    </div>
  );
};

export default Layout;