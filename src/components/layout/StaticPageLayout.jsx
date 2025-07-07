// frontend/src/components/layout/StaticPageLayout.jsx (VERSIÓN CORREGIDA CON FONDO)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiChevronLeft } from 'react-icons/hi2';

const StaticPageLayout = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    // --- INICIO DE LA CORRECCIÓN ---
    // 1. Hemos añadido un 'div' contenedor que ocupa toda la pantalla.
    // 2. Le hemos aplicado la clase 'bg-internal-background', que es la misma que usan
    //    las otras páginas internas de la app, asegurando la consistencia visual.
    <div className="w-full min-h-screen bg-internal-background bg-cover bg-center text-text-primary font-sans">
      <div className="container mx-auto max-w-lg min-h-screen flex flex-col p-4">
        <header className="flex items-center mb-6 relative">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1"
          >
            <HiChevronLeft className="w-7 h-7" />
          </button>
          <h1 className="text-xl font-bold flex-grow text-center">{title}</h1>
          <div className="w-8"></div> {/* Espaciador para centrar */}
        </header>

        {/* El resto del layout (la tarjeta glass) permanece igual. */}
        <main className="flex-grow bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 space-y-4 text-text-secondary overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
    // --- FIN DE LA CORRECCIÓN ---
  );
};

export default StaticPageLayout;