import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MarketPage from './pages/MarketPage';
import WheelPage from './pages/WheelPage';
import InvestmentPage from './pages/InvestmentPage';
import HistoryPage from './pages/HistoryPage';
import WalletPage from './pages/WalletPage';
import LanguagePage from './pages/LanguagePage';
import AboutPage from './pages/AboutPage';
import SupportPage from './pages/SupportPage';
import MaintenancePage from './components/MaintenanceScreen';
import AuthGuard from './components/AuthGuard';

// Admin Pages
import AdminApp from './admin/AdminApp';
import WheelConfigPage from './pages/admin/WheelConfigPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import SystemConfigPage from './pages/admin/SystemConfigPage';
import TransactionHistoryPage from './pages/admin/TransactionHistoryPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />

      {/* Protected User Routes */}
      <Route element={<AuthGuard />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/wheel" element={<WheelPage />} />
        <Route path="/investment" element={<InvestmentPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/language" element={<LanguagePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<AuthGuard adminRequired />}>
        <Route element={<AdminApp />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="wheel-config" element={<WheelConfigPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="system" element={<SystemConfigPage />} />
          <Route path="transactions" element={<TransactionHistoryPage />} />
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AppRoutes;