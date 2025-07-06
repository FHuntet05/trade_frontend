// frontend/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // --- INICIO DE LA SOLUCIÓN ---

  define: {
    // 1. Inyectamos la variable global 'global' que algunas librerías esperan.
    'global': 'window',
  },
  resolve: {
    alias: {
      // 2. Creamos un alias para que cualquier importación de 'buffer' 
      //    apunte a la versión del navegador que instalamos.
      buffer: 'buffer/',
    },
  },

  // --- FIN DE LA SOLUCIÓN ---
});