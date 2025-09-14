// frontend/vite.config.js (FASE "REMEDIATIO" - ALIAS DE RUTA IMPLEMENTADO)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // [REMEDIATIO] Se necesita para resolver las rutas.

export default defineConfig({
  plugins: [react()],
  
  define: {
    'global': 'window',
  },
  resolve: {
    alias: {
      buffer: 'buffer/',
      // [REMEDIATIO - SOLUCIÓN ESTRUCTURAL]
      // Se crea un alias para que '@' apunte a la carpeta 'src'.
      // Esto nos permite usar rutas absolutas y robustas en toda la aplicación.
      '@': path.resolve(__dirname, './src'),
    },
  },
});