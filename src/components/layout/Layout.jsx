// RUTA: frontend/src/components/layout/Layout.jsx (v2.0 - NEXUS FLEXBOX REBUILD)

import React, { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import BottomNavBar from './BottomNavBar';
import FloatingSupportButton from '../common/FloatingSupportButton';

const Layout = () => {
  const dragContainerRef = useRef(null);
  
  // --- CORRECCIÓN ARQUITECTÓNICA ---
  // Se eliminan las comprobaciones de 'isAuthenticated' y 'isLoadingAuth'.
  // Esa responsabilidad ya ha sido gestionada por el componente 'UserGatekeeper' en App.jsx.
  // El componente Layout ahora se centra en su única responsabilidad: la maquetación.

  return (
    <div className="h-screen w-screen flex justify-center bg-black">
      {/* 
        --- CORRECCIÓN DE MAQUETACIÓN (FLEXBOX) ---
        1. Se añaden 'flex' y 'flex-col' para convertir este div en un contenedor Flexbox vertical.
           Esto permite un control preciso sobre sus hijos.
      */}
      <div 
        ref={dragContainerRef} 
        className="h-full w-full max-w-lg relative font-sans bg-background text-text-primary flex flex-col"
      >
        {/*
          2. El 'main' ya no necesita 'h-full'.
          3. Se añade 'flex-1' para que este elemento "crezca" y ocupe todo el espacio vertical
             disponible, empujando la barra de navegación hacia abajo.
          4. 'overflow-y-auto' es crucial para que solo esta área de contenido tenga scroll.
        */}
        <main className="flex-1 w-full overflow-y-auto no-scrollbar">
          <Outlet />
        </main>
        
        {/* 
          3. El BottomNavBar ahora se posicionará correctamente al final del contenedor flex.
        */}
        <BottomNavBar />
        <FloatingSupportButton dragRef={dragContainerRef} />
        
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: 'var(--color-card)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            },
            success: { iconTheme: { primary: 'var(--color-status-success)', secondary: 'var(--color-card)' } },
            error: { iconTheme: { primary: 'var(--color-status-danger)', secondary: 'var(--color-card)' } }
          }}
        />
      </div>
    </div>
  );
};

export default Layout;