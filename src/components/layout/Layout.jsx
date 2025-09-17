// RUTA: frontend/src/components/layout/Layout.jsx (v2.0 - NEXUS FLEXBOX REBUILD)

import React, { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import BottomNavBar from './BottomNavBar';
import FloatingSupportButton from '../common/FloatingSupportButton';

const Layout = () => {
  const dragContainerRef = useRef(null);

  return (
    <div className="h-screen w-screen flex justify-center bg-black">
      <div 
        ref={dragContainerRef} 
        className="h-full w-full max-w-lg relative font-sans bg-background text-text-primary flex flex-col"
      >
        <main className="flex-1 w-full overflow-y-auto no-scrollbar">
          <Outlet />
        </main>
        
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