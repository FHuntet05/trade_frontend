// --- START OF FILE src/components/layout/Layout.jsx ---

// frontend/src/components/layout/Layout.jsx (MODIFICADO: Barra de navegación con nuevo estilo sólido)
import React, { useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';
import FloatingSupportButton from '../common/FloatingSupportButton';
import './LayoutAnimations.css';

const Layout = () => {
  const location = useLocation();
  const dragContainerRef = useRef(null);

  const backgroundClass = location.pathname === '/' 
    ? 'bg-space-background bg-cover bg-center' 
    : 'bg-internal-background bg-cover bg-center';

  return (
    <div ref={dragContainerRef} className={`w-full min-h-screen text-text-primary font-sans ${backgroundClass} overflow-hidden`}>
      <div className="container mx-auto max-w-lg min-h-screen flex flex-col bg-transparent">
        <main className="flex-grow p-4 pb-28 flex flex-col overflow-y-auto">
          <div key={location.pathname} className="flex flex-col flex-grow fade-in">
            <Outlet />
          </div>
        </main>
        
        <footer className="fixed bottom-0 left-0 right-0 w-full max-w-lg mx-auto z-50 p-4">
          {/* --- CAMBIO DE ESTILO DE LA BARRA DE NAVEGACIÓN --- */}
          {/*
            - Antes: bg-black/50 backdrop-blur-lg rounded-full shadow-glow border border-white/10
            - Ahora: 
              - bg-slate-900: Fondo sólido oscuro, similar al de los items del ranking.
              - rounded-xl: Bordes suavemente redondeados, no en forma de píldora. (Puedes probar con 'rounded-lg' o 'rounded-2xl' si prefieres).
              - border border-white/10: Se mantiene un borde sutil para definir la forma.
            - Se han eliminado 'backdrop-blur-lg' y 'shadow-glow'.
          */}
          <div className="bg-slate-900 rounded-xl border border-white/10">
            <BottomNavBar />
          </div>
        </footer>

        <FloatingSupportButton dragRef={dragContainerRef} />
      </div>
    </div>
  );
};

export default Layout;
// --- END OF FILE src/components/layout/Layout.jsx ---