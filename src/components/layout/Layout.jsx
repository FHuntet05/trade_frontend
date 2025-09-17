// src/components/layout/Layout.jsx (VERSIÓN VISIBLE)
import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#121212', // dark-primary
        color: '#E0E0E0', // text-primary
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column'
    }}>
      <main style={{
          flexGrow: 1,
          padding: '1rem',
          paddingBottom: '7rem', // Espacio para el footer
          overflowY: 'auto'
      }}>
        <h1 style={{color: 'limegreen', border: '2px solid limegreen', padding: '10px', textAlign: 'center'}}>LAYOUT CARGADO</h1>
        <Outlet />
      </main>
      
      <footer style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1rem',
          zIndex: 50
      }}>
          <div style={{
              height: '5rem', // 80px
              backgroundColor: '#0f172a', // slate-900
              borderRadius: '0.75rem', // rounded-xl
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
          }}>
             <p>BottomNavBar Placeholder</p>
          </div>
      </footer>
    </div>
  );
};

export default Layout;