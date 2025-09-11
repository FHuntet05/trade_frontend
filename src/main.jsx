// frontend/src/main.jsx (LÓGICA DE DESPACHO)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // La app principal del Bot
import AdminApp from './admin/AdminApp'; // La nueva app del Panel de Admin
import './index.css';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// Lógica de Despacho: Decide qué aplicación renderizar.
// Si la URL comienza con '/admin', carga el panel de administración.
// De lo contrario, carga el bot de Telegram.
if (window.location.pathname.startsWith('/admin')) {
  root.render(
    <React.StrictMode>
      <AdminApp />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}