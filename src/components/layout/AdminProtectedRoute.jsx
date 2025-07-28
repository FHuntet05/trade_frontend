// frontend/src/components/layout/AdminProtectedRoute.jsx (VERSIÓN SIMPLIFICADA Y CORRECTA)

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import Loader from '../common/Loader';

const AdminProtectedRoute = () => {
  // La única fuente de verdad es el userStore.
  const { user, isAuthenticated, isLoadingAuth } = useUserStore();

  // 1. Mientras se verifica la autenticación inicial, mostramos un loader.
  if (isLoadingAuth) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-dark-primary">
        <Loader text="Verificando sesión..." />
      </div>
    );
  }

  // 2. Una vez que la carga ha terminado, la única condición es: ¿Está el usuario autenticado Y es admin?
  // Esta doble verificación asegura que solo los administradores autenticados pasen.
  const isAuthorizedAdmin = isAuthenticated && user?.role === 'admin';
  
  // 3. Si es un administrador autorizado, se le da acceso.
  // Si no, se le redirige a la página de inicio del usuario, que es la ruta segura por defecto.
  return isAuthorizedAdmin ? <Outlet /> : <Navigate to="/home" replace />;
};

export default AdminProtectedRoute;