// RUTA: frontend/tailwind.config.js (v5.2 - FONDOS CONTEXTUALES)

import colors from 'tailwindcss/colors';

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // --- INICIO DE LA MODIFICACIÓN ---
      // Se definen AMBOS fondos para que Tailwind los reconozca
      // y podamos usarlos en diferentes contextos.
      backgroundImage: {
        'home-background': "url('/assets/images/space-bg.png')",
        'internal-background': "url('/assets/images/internal-bg.png')",
      },
      // --- FIN DE LA MODIFICACIÓN ---

      colors: {
        
        // --- PALETA "LUJO DORADO" (Se mantiene intacta) ---
        background: colors.gray[950],
        card: colors.gray[900],
        
        text: {
          primary: colors.gray[100],
          secondary: colors.gray[400],
          tertiary: colors.gray[500],
        },
        
        accent: {
          primary: colors.amber[400],
          primary_hover: colors.amber[500],
          secondary: colors.amber[300],
          secondary_hover: colors.amber[400],
          tertiary: colors.amber[400],
          tertiary_hover: colors.amber[500],
        },

        status: {
            success: colors.green[400],
            warning: colors.amber[500],
            danger: colors.red[500],
            danger_hover: colors.red[600]
        },

        border: colors.gray[800],

        // --- PALETA TEMA OSCURO (ADMIN) - (Se mantiene intacta) ---
        dark: {
          primary: '#111827',
          secondary: '#1f2937',
          tertiary: '#374151',
        },
        'accent-start': '#3b82f6',
        'accent-end': '#14b8a6',
      },
      
      boxShadow: {
        'subtle': '0 4px 12px 0 rgb(255 255 255 / 0.05)',
        'medium': '0 8px 30px rgb(0 0 0 / 0.2)',
      },

      keyframes: {
        spin: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 1s linear infinite', 
      }
    },
  },
  plugins: [],
};