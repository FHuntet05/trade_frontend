import { useSpring } from 'react-spring';

// iOS-style animations
export const animations = {
  // Transición suave para elementos que aparecen
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: {
      tension: 280,
      friction: 20
    }
  },

  // Animación para botones al presionar
  buttonPress: {
    from: { scale: 1 },
    to: { scale: 0.97 },
    config: {
      tension: 300,
      friction: 10
    }
  },

  // Animación para la ruleta
  spin: {
    from: { rotate: 0 },
    to: { rotate: 360 },
    config: {
      tension: 280,
      friction: 20
    }
  },

  // Animación para abrir cofre
  openChest: {
    from: { scale: 1, rotate: 0 },
    to: async (next) => {
      await next({ scale: 1.1, rotate: -5 });
      await next({ scale: 1.2, rotate: 5 });
      await next({ scale: 1, rotate: 0 });
    },
    config: {
      tension: 300,
      friction: 10
    }
  },

  // Transición de página al estilo iOS
  pageTransition: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },

  // Efecto rebote suave para elementos que aparecen
  bounceIn: {
    from: { scale: 0.3, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: {
      tension: 280,
      friction: 20
    }
  }
};

// Hook personalizado para animaciones de scroll
export const useScrollAnimation = (threshold = 0.2) => {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return useSpring({
    opacity: scrollY > threshold ? 1 : 0,
    transform: `translateY(${scrollY > threshold ? 0 : 20}px)`,
    config: {
      tension: 280,
      friction: 20
    }
  });
};