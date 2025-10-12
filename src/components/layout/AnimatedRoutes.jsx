import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const pageVariants = {
    initial: {
      opacity: 0,
      x: '100%'
    },
    animate: {
      opacity: 1,
      x: 0
    },
    exit: {
      opacity: 0,
      x: '-100%'
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          }
        />
        <Route
          path="/market"
          element={
            <PageTransition>
              <MarketPage />
            </PageTransition>
          }
        />
        {/* Añadir resto de rutas */}
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;