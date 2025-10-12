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
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['@react-spring/web']
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'animation-vendor': ['@react-spring/web', 'framer-motion'],
        }
      }
    }
  }
});