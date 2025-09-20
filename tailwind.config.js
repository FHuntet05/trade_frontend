// frontend/tailwind.config.js (VERSIÓN "NEXUS - PINK SYNC")
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
        
        // [NEXUS VISUAL SYNC] - INICIO DE LA CORRECCIÓN
        // Se reemplaza el objeto de gradiente por un único color de acento rosa.
        'accent': '#EC4899', // Equivale a 'pink-500' en la paleta de Tailwind.
        // [NEXUS VISUAL SYNC] - FIN DE LA CORRECCIÓN
      },
      backgroundImage: {
        'internal-background': "url('/assets/internal-bg.png')",
        'space-background': "url('/assets/space-bg.png')",
      },
      boxShadow: {
        // [NEXUS VISUAL SYNC] - Se actualiza el color del 'glow' para que coincida con el nuevo 'accent'.
        'glow': '0 0 15px 5px rgba(236, 72, 153, 0.4)', // Sombra basada en #EC4899
      },
    },
  },
  plugins: [],
};