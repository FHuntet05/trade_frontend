// RUTA: src/components/layout/Layout.jsx (VERSIÓN NEXUS - ELIMINACIÓN TOTAL DE ANIMACIÓN)
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
// Se eliminan las importaciones de 'motion' y 'AnimatePresence'
// import { motion, AnimatePresence } from 'framer-motion'; 
import BottomNavBar from './BottomNavBar';

const Layout = () => {
  // 'useLocation' ya no es necesario para la animación, pero lo mantenemos
  // por si es útil para la lógica del fondo (backgroundClass).
  const location = useLocation();

  const backgroundClass = location.pathname === '/home' || location.pathname === '/'
    ? 'bg-space-background' 
    : 'bg-internal-background';

  return (
    <div className={`w-full min-h-screen text-text-primary font-sans ${backgroundClass} bg-cover bg-center bg-fixed`}>
      <div className="container mx-auto max-w-lg h-screen flex flex-col bg-transparent">
        
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {/*
            ======================= CORRECCIÓN DEFINITIVA =======================
            Se eliminan por completo los componentes 'AnimatePresence' y 'motion.div'.
            El 'Outlet' se renderiza directamente.
            
            Esto asegura que:
            1. React Router tiene el control total y exclusivo sobre cuándo una página
               se monta y se desmonta. No hay interferencia.
            2. El problema de duplicación (causado por un mal manejo del ciclo de vida
               por parte de AnimatePresence) se elimina de raíz.
            3. El problema de invisibilidad (causado por un colapso de altura durante
               la animación) también se elimina.
            
            Esta es la configuración más estable y a prueba de fallos.
            ======================= FIN DE LA CORRECCIÓN =========================
          */}
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