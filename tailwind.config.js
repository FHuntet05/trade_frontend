// frontend/tailwind.config.js (VERSIÓN "NEXUS - PINK SYNC")
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // iOS System Colors
        'ios-green': {
          DEFAULT: '#34C759',
          light: '#30D158',
          dark: '#32D74B',
        },
        'ios-white': {
          DEFAULT: '#FFFFFF',
          secondary: '#F2F2F7',
          tertiary: '#E5E5EA',
        },
        // Semantic Colors
        'system': {
          background: '#FFFFFF',
          secondary: '#F2F2F7',
          grouped: '#F2F2F7',
          'grouped-secondary': '#FFFFFF',
        },
        'internal': {
          background: '#F5F7FA',
          card: '#FFFFFF',
          highlight: '#EDF2F7',
        },
        'text': {
          primary: '#000000',
          secondary: '#3C3C43',
          tertiary: '#3C3C4399',
        },
        // Custom Gradients
        'gradient': {
          'green-light': '#4CD964',
          'green-dark': '#34C759',
        }
      },
      // iOS Typography
      fontFamily: {
        'ios': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Helvetica Neue', 'sans-serif'],
        'ios-display': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Helvetica Neue', 'sans-serif'],
      },
      // iOS Shadows & Effects
      boxShadow: {
        'ios-bottom': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'ios-card': '0 2px 8px rgba(0, 0, 0, 0.12)',
        'ios-button': '0 1px 2px rgba(0, 0, 0, 0.05)',
      },
      // iOS Border Radius
      borderRadius: {
        'ios': '10px',
        'ios-xl': '14px',
        'ios-2xl': '18px',
        'ios-button': '8px',
        'ios-card': '12px',
      },
      // iOS Animation Timing
      transitionTimingFunction: {
        'ios': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ios-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
};