// frontend/src/components/layout/AdminProtectedRoute.jsx (COMPLETO)

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAdminStore from '../../store/adminStore';

const AdminProtectedRoute = () => {
  const { isAuthenticated } = useAdminStore((state) => state);

  // Si el administrador está autenticado, renderiza el contenido de la ruta anidada (el "Outlet").
  // Si no, lo redirige a la página de inicio de sesión.
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute;