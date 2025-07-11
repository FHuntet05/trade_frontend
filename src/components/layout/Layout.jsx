// frontend/src/components/layout/Layout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';
import './LayoutAnimations.css';

const Layout = () => {
  const location = useLocation();

  const backgroundClass = location.pathname === '/' 
    ? 'bg-space-background bg-cover bg-center' 
    : 'bg-internal-background bg-cover bg-center';

  return (
    <div className={`w-full min-h-screen text-text-primary font-sans ${backgroundClass}`}>
      <div className="container mx-auto max-w-lg min-h-screen flex flex-col bg-transparent">
        {/* El padding inferior en main asegura que el contenido no quede oculto por la barra de navegación flotante */}
        <main className="flex-grow p-4 pb-28 flex flex-col overflow-y-auto">
          <div key={location.pathname} className="flex flex-col flex-grow fade-in">
            <Outlet />
          </div>
        </main>
        
        {/* --- INICIO DE LA MODIFICACIÓN DEL FOOTER (BARRA DE NAVEGACIÓN) --- */}
        <footer className="fixed bottom-0 left-0 right-0 w-full max-w-lg mx-auto z-50 p-4">
          {/* El div interno contiene los estilos de la píldora flotante */}
          <div className="bg-black/30 backdrop-blur-md rounded-full shadow-2xl shadow-purple-500/20 border border-white/10">
            <BottomNavBar />
          </div>
        </footer>
        {/* --- FIN DE LA MODIFICACIÓN DEL FOOTER --- */}

      </div>
    </div>
  );
};

export default Layout;