// frontend/src/components/layout/StaticPageLayout.jsx (VERSIÓN FINAL CON ESTILO GLASS)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiChevronLeft } from 'react-icons/hi2';

const StaticPageLayout = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    // 1. El contenedor principal ahora es transparente y solo gestiona el padding y la animación.
    <div className="p-4 flex flex-col h-full animate-fade-in text-white">
      <header className="flex items-center mb-6 relative">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1" // Ajustamos el padding para alinear con otras páginas
        >
          <HiChevronLeft className="w-7 h-7" />
        </button>
        <h1 className="text-xl font-bold flex-grow text-center">{title}</h1>
        <div className="w-8"></div> {/* Espaciador para centrar perfectamente el título */}
      </header>

      {/* 2. El contenido (children) se renderiza dentro de una tarjeta con el estilo glassmorphism. */}
      <main className="flex-grow bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 space-y-4 text-text-secondary overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default StaticPageLayout;