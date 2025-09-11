// frontend/src/components/layout/AdminProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAdminStore from '../../store/adminStore';
import Loader from '../common/Loader'; // Asumo que existe un componente Loader

const AdminProtectedRoute = () => {
  const { isAuthenticated, token } = useAdminStore.getState(); // Usamos getState para lectura síncrona en render
  const location = useLocation();
  
  // En una arquitectura persistente, el token puede existir antes que isAuthenticated se hidrate.
  // Por lo tanto, confiar en el token es más robusto para la comprobación inicial.
  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;