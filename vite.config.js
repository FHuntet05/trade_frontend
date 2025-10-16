// RUTA: frontend/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  define: {
    'global': 'window',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@store': path.resolve(__dirname, './src/store'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@assets': path.resolve(__dirname, './src/assets'),
      'buffer': 'buffer/',
      // --- INICIO DE LA CORRECCIÓN CRÍTICA ---
      // Este alias resuelve el error de build en Vercel.
      // Le dice a Vite que cuando un archivo busque "react-spring",
      // debe usar el paquete "@react-spring/web" que está instalado.
      'react-spring': '@react-spring/web',
      // --- FIN DE LA CORRECCIÓN CRÍTICA ---
    },
    extensions: ['.js', '.jsx', '.json'],
  },
  optimizeDeps: {
    include: ['@react-spring/web', 'zustand', 'zustand/middleware']
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'animation-vendor': ['@react-spring/web', 'framer-motion'],
          'state-vendor': ['zustand']
        }
      }
    },
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  }
});