// RUTA: frontend/src/components/layout/Layout.jsx (VERSIÓN "NEXUS - SAFE AREA FIX")

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import BottomNavBar from './BottomNavBar';
import FloatingSupportButton from '../common/FloatingSupportButton';

// Nota: La lógica de Loader y UserGatekeeper se ha movido a App.jsx,
// por lo que este componente ahora es más simple y se enfoca solo en el layout.

const Layout = () => {
  return (
    // [NEXUS SAFE AREA FIX] - 1. Contenedor principal de la aplicación.
    // Usamos `h-[100dvh]` para una altura de viewport dinámica y precisa en móviles.
    // `pb-[env(safe-area-inset-bottom)]` es la clave: añade un padding automático
    // en la parte inferior solo en dispositivos como iPhone para evitar la barra de gestos.
    <div className="h-[100dvh] w-screen flex justify-center bg-black">
      <div 
        className="h-full w-full max-w-lg relative font-sans bg-dark-primary text-text-primary overflow-hidden"
      >
        {/* 
          [NEXUS SAFE AREA FIX] - 2. Contenedor del contenido de la página.
          `pb-16` asegura que el contenido scrolleable siempre tenga espacio
          para no quedar oculto detrás del BottomNavBar (que tiene altura h-16).
        */}
        <main className="h-full w-full overflow-y-auto no-scrollbar pb-16">
          <Outlet />
        </main>
        
        {/* 
          [NEXUS SAFE AREA FIX] - 3. El BottomNavBar se mantiene igual, pero el padding
          en el contenedor padre le dará el espacio necesario en la parte inferior.
        */}
        <BottomNavBar />
        
        <FloatingSupportButton />
        
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#1F2937', // bg-dark-secondary
              color: '#E5E7EB', // text-text-primary
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        />
      </div>
    </div>
  );
};

export default Layout;