// src/pages/HomePage.jsx (VERSIÓN VISIBLE)
import React from 'react';
import useUserStore from '../store/userStore';

const HomePage = () => {
  const { user } = useUserStore();

  return (
    <div style={{
        border: '5px solid cyan',
        padding: '2rem',
        marginTop: '1rem',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px'
    }}>
      <h1 style={{ fontSize: '2rem', textAlign: 'center' }}>
        HOMEPAGE CARGADA
      </h1>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        El problema está 100% en la configuración de Tailwind/CSS.
      </p>
      <div style={{ marginTop: '1.5rem', backgroundColor: 'black', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
        <pre>
          {user ? JSON.stringify(user, null, 2) : "Cargando datos del usuario..."}
        </pre>
      </div>
    </div>
  );
};

export default HomePage;