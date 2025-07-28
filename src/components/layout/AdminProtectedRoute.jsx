// frontend/src/components/layout/AdminProtectedRoute.jsx (MODIFICADO PARA ACCESO DIRECTO)

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// [ACCESO DIRECTO ADMIN] - Se importa el store principal de usuario
import useUserStore from '../../store/userStore';
import Loader from '../common/Loader'; // Añadimos un loader para una mejor experiencia

const AdminProtectedRoute = () => {
  // [ACCESO DIRECTO ADMIN] - Se utiliza useUserStore como la única fuente de verdad.
  const { user, isAuthenticated, isLoadingAuth } = useUserStore();

  // 1. Mientras se verifica la autenticación inicial, mostramos un loader.
  // Esto previene un parpadeo o redirección prematura.
  if (isLoadingAuth) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-dark-primary">
        <Loader text="Verificando acceso de administrador..." />
      </div>
    );
  }

  // 2. Una vez que la carga ha terminado, verificamos las condiciones.
  // El usuario debe estar autenticado Y tener el rol de 'admin'.
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // 3. Si es un administrador, se le da acceso al dashboard y a las rutas anidadas.
  // Si no, se le redirige a la página de inicio del usuario para evitar bucles.
  return isAdmin ? <Outlet /> : <Navigate to="/home" replace />;
};

export default AdminProtectedRoute;