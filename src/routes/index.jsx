// RUTA: frontend/src/routes/index.jsx
// RUTA: frontend/src/routes/index.jsx (VERSIÓN DE PRUEBA DE AISLAMIENTO)

import React from 'react';

// Ignoramos todas las importaciones y rutas complejas temporalmente.

const AppRoutes = () => {
  // En lugar de renderizar el complejo árbol de componentes,
  // devolvemos el elemento más simple posible para verificar si la app puede renderizar ALGO.
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#34C759', // Verde iOS
      color: 'white',
      fontSize: '24px',
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      textAlign: 'center',
      padding: '20px'
    }}>
      Si ves este mensaje verde, la autenticación funciona. El error está en un componente de la UI.
    </div>
  );
};

export default AppRoutes;
/*
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AuthGuard from '@/components/AuthGuard';

// Páginas de la aplicación de usuario
import HomePage from '@/pages/HomePage';
import MarketPage from '@/pages/MarketPage';
import QuantitativePage from '@/pages/QuantitativePage';
import WheelPage from '@/pages/WheelPage';
import ProfilePage from '@/pages/ProfilePage';
import LanguagePage from '@/pages/LanguagePage';
import SupportPage from '@/pages/SupportPage';
import AboutPage from '@/pages/AboutPage';
import NotFoundPage from '@/pages/NotFoundPage';
import DepositPage from '@/pages/DepositPage';
import FinancialHistoryPage from '@/pages/FinancialHistoryPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AuthGuard />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/quantitative" element={<QuantitativePage />} />
          <Route path="/wheel" element={<WheelPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

      {/* Rutas sin el layout principal (BottomNavBar) }
        <Route path="/deposit" element={<DepositPage />} />
        <Route path="/history" element={<FinancialHistoryPage />} />
        <Route path="/language" element={<LanguagePage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;*/