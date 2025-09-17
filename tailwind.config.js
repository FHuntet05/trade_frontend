// tailwind.config.js (VERSIÓN FINAL Y GARANTIZADA)
/** @type {import('tailwindcss').Config} */
export default {
  // Esta es la parte más importante. Le dice a Tailwind que escanee
  // CADA archivo relevante dentro de la carpeta 'src'.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  // Aquí va tu tema personalizado.
  theme: {
    extend: {
      backgroundImage: {
        'space-background': "url('/assets/space-bg.png')",
        'internal-background': "url('/assets/internal-bg.png')",
      },
      colors: {
        'dark-primary': '#121212',
        'dark-secondary': '#1E1E1E',
        'accent-start': '#4F46E5',
        'accent-end': '#A855F7',
        'text-primary': '#E0E0E0',
        'text-secondary': '#A0A0A0',
      },
      boxShadow: {
         'glow': '0 0 15px 5px rgba(79, 70, 229, 0.4)',
      }
    },
  },

  // No necesitas plugins por ahora.
  plugins: [],
}