// frontend/src/main.jsx (FASE "PERFECTIO" - INICIALIZACIÓN DE i18n CORREGIDA)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminApp from './admin/AdminApp';
import './index.css';

// [PERFECTIO - CORRECCIÓN CRÍTICA]
// Se importa el archivo de configuración de i18next.
// Esta línea ejecuta la lógica dentro de i18n.js, inicializando la librería
// y haciéndola disponible para toda la aplicación a través del contexto de React.
import './i18n';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

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