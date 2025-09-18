// RUTA: src/components/layout/Layout.jsx (VERSIÓN NEXUS - ANIMACIÓN NEUTRALIZADA)
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
          {/* ======================= INICIO DE LA CORRECCIÓN CRÍTICA ======================= */}
          {/*
            PASO 1: Se elimina 'mode="wait"' de AnimatePresence.
            Esto evita que el componente saliente espere a terminar su animación, lo que puede
            complicar el cálculo de la altura del contenedor.

            PASO 2: Se eliminan las propiedades 'initial', 'animate' y 'exit' del motion.div.
            Al hacerlo, el motion.div actúa como un simple contenedor. Si las páginas aparecen
            ahora, confirmaremos que el problema era una propiedad específica de la animación
            (probablemente 'exit' o 'y: 20') que estaba causando un colapso de la altura.
            Mantenemos el 'key' porque es esencial para que AnimatePresence detecte el cambio.
          */}
          <AnimatePresence>
            <motion.div key={location.pathname}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
          {/* ======================== FIN DE LA CORRECCIÓN CRÍTICA ========================= */}
        </main>
        
        <footer className="flex-shrink-0 w-full px-4 pb-6 pt-2">
          <BottomNavBar />
        </footer>

      </div>
    </div>
  );
};

export default Layout;