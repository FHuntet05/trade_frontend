// RUTA: src/components/layout/Layout.jsx (VERSIÓN NEXUS - RENDERIZADO ESTRICTO Y SCROLL OCULTO)
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
        
        {/*
          [CORRECCIÓN 1: OCULTAR LA BARRA DE SCROLL]
          La clase 'no-scrollbar' (definida en index.css) se aplica aquí.
          Esto oculta visualmente la barra de scroll en todos los navegadores,
          pero MANTIENE la funcionalidad de poder desplazarse con el ratón o el dedo.
          El scroll funcionará, pero no se verá.
        */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {/*
            [CORRECCIÓN 2: FORZAR RENDERIZADO LIMPIO]
            Se reintroduce `mode="wait"`. Esta es la directiva más importante.
            Le dice a AnimatePresence: "Espera a que la animación de salida (exit)
            del componente antiguo termine COMPLETAMENTE antes de empezar a renderizar
            y animar el nuevo componente". Esto previene la superposición y el
            renderizado duplicado que causaba el problema de la "multi-carga".
          */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              /*
                [CORRECCIÓN 3: ANIMACIÓN MÍNIMA Y SEGURA]
                Se utiliza únicamente la propiedad 'opacity'. Esto evita cualquier
                cálculo de posición ('y', 'x') o tamaño que pudiera causar
                conflictos. Es la forma más robusta y segura de animar transiciones
                entre componentes de tamaño variable.
              */
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }} // Una transición muy rápida para que sea casi instantánea
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