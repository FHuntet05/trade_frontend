// RUTA: frontend/src/routes/index.jsx

import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

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
      {/* El AuthGuard se elimina de aquí, ya que UserGatekeeper en App.jsx maneja la protección global */}
      
      {/* Rutas que utilizan el Layout principal con BottomNavBar */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/quantitative" element={<QuantitativePage />} />
        <Route path="/wheel" element={<WheelPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      
      {/* Rutas sin el layout principal */}
      <Route path="/deposit" element={<DepositPage />} />
      <Route path="/history" element={<FinancialHistoryPage />} />
      <Route path="/language" element={<LanguagePage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Ruta para páginas no encontradas */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;