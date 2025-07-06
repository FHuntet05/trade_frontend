// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// LA LÍNEA CLAVE: Asegúrate de que esta ruta sea exacta.
// Si tu archivo está en 'src/styles/global.css', esta es la importación correcta.
import './styles/global.css';

// La importación de i18n también debe estar aquí.
import './i18n'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);