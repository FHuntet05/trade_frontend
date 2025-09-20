// frontend/tailwind.config.js (VERSIÓN "NEXUS - UNICOLOR REFINEMENT")
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
        
        // [NEXUS UNICOLOR] - INICIO DE LA CORRECCIÓN
        // Se reemplaza el objeto de gradiente por un único color de acento.
        'accent': '#F472B6', // Un rosa claro y moderno.
        // [NEXUS UNICOLOR] - FIN DE LA CORRECCIÓN
      },
      backgroundImage: {
        'internal-background': "url('/assets/internal-bg.png')",
        'space-background': "url('/assets/space-bg.png')",
        // La clase 'primary-gradient' ya no es necesaria si no se usa en otros lugares.
      },
      boxShadow: {
        // [NEXUS UNICOLOR] - Se actualiza el color del 'glow' para que coincida con el nuevo 'accent'.
        'glow': '0 0 15px 5px rgba(244, 114, 182, 0.4)', // Sombra basada en #F472B6
      },
    },
  },
  plugins: [],
};