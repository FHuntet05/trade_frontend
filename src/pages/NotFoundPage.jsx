// frontend/src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white text-center p-4">
      <h1 className="text-6xl font-bold text-pink-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Página no encontrada</h2>
      <p className="text-gray-400 mb-8">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Link
        to="/"
        className="px-6 py-3 font-bold text-white rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg shadow-purple-500/30"
      >
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;