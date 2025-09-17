// frontend/tailwind.config.js (VERSIÓN ACTUALIZADA CON AMBOS FONDOS)
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'dark-primary': '#0D0B1F',   // Púrpura muy oscuro
        'dark-secondary': '#1A183E', // Púrpura oscuro para tarjetas
        'dark-tertiary': '#101128',  // Azul casi negro
        'text-primary': '#FFFFFF',
        'text-secondary': '#A9A7C3',
        'accent': {
          'start': '#E84D8A',
          'end': '#A149E2',
        },
      },
      backgroundImage: {
       
        // Fondo 1: El degradado para las páginas internas
       'internal-background': "url('/assets/internal-bg.png')",
        // Fondo 2: La imagen de estrellas para el Home
        'space-background': "url('/assets/space-bg.png')",
        'primary-gradient': 'linear-gradient(to right, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow': '0 0 15px 5px rgba(232, 77, 138, 0.4)',
      },
    },
  },
  plugins: [],
};